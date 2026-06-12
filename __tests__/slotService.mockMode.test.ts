jest.mock('../src/config/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(),
  },
}));

describe('slotService mock mode', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = {
      ...originalEnv,
      EXPO_PUBLIC_SLOT_DATA_SOURCE: 'mock',
      EXPO_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
      EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'test-key',
    };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('returns mock guides and slots when mock mode is selected', async () => {
    jest.useFakeTimers();

    const { mockGuides } = require('../src/mocks/guides') as typeof import('../src/mocks/guides');
    const { mockSlots } = require('../src/mocks/slots') as typeof import('../src/mocks/slots');
    const {
      fetchGuides,
      fetchAvailableSlots,
    } = require('../src/services/slotService') as typeof import('../src/services/slotService');

    const guidesPromise = fetchGuides();
    const slotsPromise = fetchAvailableSlots(mockGuides[0].id);

    jest.advanceTimersByTime(300);

    await expect(guidesPromise).resolves.toEqual(mockGuides);
    await expect(slotsPromise).resolves.toEqual(
      mockSlots.filter((slot) => slot.guideId === mockGuides[0].id),
    );

    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });
});
