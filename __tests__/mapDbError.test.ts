jest.mock('../src/config/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

import { supabase } from '../src/config/supabase';
import { handleDbError, mapDbError, reportError } from '../src/lib/errors/mapDbError';

describe('mapDbError', () => {
  const fromMock = supabase.from as jest.Mock;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.clearAllMocks();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('maps preference not-null violations to a recoverable preferences step error', () => {
    expect(
      mapDbError({
        code: '23502',
        message: 'null value in column "distance_min"',
        details: 'Failing row contains distance_min',
      }),
    ).toEqual({
      message: "A required detail was missing, so we couldn't save your responses.",
      action: 'goToStep',
      step: 'preferences',
      report: true,
      code: '23502',
    });
  });

  it('maps permission errors to reauth', () => {
    expect(mapDbError({ code: '42501', message: 'new row violates row-level security' })).toEqual({
      message: "Your session doesn't have permission to do that. Please sign in again.",
      action: 'reauth',
      report: true,
      code: '42501',
    });
  });

  it('logs reportable errors to client_errors with context', async () => {
    const insert = jest.fn().mockResolvedValue({ data: null, error: null });
    fromMock.mockReturnValue({ insert });

    await handleDbError(
      {
        code: '23502',
        message: 'null value in column "distance_min"',
        details: 'Failing row contains distance_min',
        hint: 'Check the payload',
      },
      { screen: 'Onboarding', action: 'saveCompletedOnboarding', userId: 'user-1' },
    );

    expect(fromMock).toHaveBeenCalledWith('client_errors');
    expect(insert).toHaveBeenCalledWith({
      user_id: 'user-1',
      context: 'Onboarding / saveCompletedOnboarding',
      pg_code: '23502',
      message: 'null value in column "distance_min"',
      details: 'Failing row contains distance_min',
      hint: 'Check the payload',
      raw: {
        code: '23502',
        message: 'null value in column "distance_min"',
        details: 'Failing row contains distance_min',
        hint: 'Check the payload',
      },
      app: 'consumer',
    });
  });

  it('does not throw when error reporting fails', async () => {
    fromMock.mockReturnValue({
      insert: jest.fn().mockRejectedValue(new Error('network down')),
    });

    await expect(reportError({ code: '23502' }, { userId: 'user-1' })).resolves.toBeUndefined();
  });
});
