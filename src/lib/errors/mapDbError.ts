import { supabase } from '../../config/supabase';

export type RecoveryAction = 'retry' | 'goToStep' | 'reauth' | 'contactSupport' | 'none';

export interface MappedError {
  message: string;
  action: RecoveryAction;
  step?: 'profile' | 'preferences';
  report: boolean;
  code: string | null;
}

interface PostgrestLikeError {
  code?: string | null;
  message?: string | null;
  details?: string | null;
  hint?: string | null;
}

export interface ReportContext {
  userId?: string | null;
  screen?: string;
  action?: string;
  app?: string;
}

const GENERIC: MappedError = {
  message: 'Something went wrong on our end. Please try again in a moment.',
  action: 'retry',
  report: true,
  code: null,
};

export function mapDbError(error: unknown): MappedError {
  const e = (error ?? {}) as PostgrestLikeError;
  const code = e.code ?? null;

  switch (code) {
    case '23502':
      return {
        message: "A required detail was missing, so we couldn't save your responses.",
        action: 'goToStep',
        step: guessStepFromColumn(e.details ?? e.message ?? ''),
        report: true,
        code,
      };
    case '23514':
      return {
        message: 'One of your answers was outside the allowed range. Please review and try again.',
        action: 'goToStep',
        step: guessStepFromColumn(e.message ?? ''),
        report: true,
        code,
      };
    case '23505':
      return {
        message: 'This looks like it was already saved. Refresh and check before trying again.',
        action: 'retry',
        report: false,
        code,
      };
    case '23503':
      return {
        message: "We couldn't link your responses to your account. Please sign in again.",
        action: 'reauth',
        report: true,
        code,
      };
    case '42501':
      return {
        message: "Your session doesn't have permission to do that. Please sign in again.",
        action: 'reauth',
        report: true,
        code,
      };
    case '42P17':
      return {
        message: 'We hit a temporary problem loading your account. Please try again shortly.',
        action: 'retry',
        report: true,
        code,
      };
    case '40001':
    case '40P01':
      return {
        message: "That didn't go through. Please try again.",
        action: 'retry',
        report: false,
        code,
      };
    case 'PGRST116':
      return {
        message: "We couldn't find that record. Please refresh and try again.",
        action: 'retry',
        report: true,
        code,
      };
    case 'PGRST301':
      return {
        message: 'Your session has expired. Please sign in again.',
        action: 'reauth',
        report: false,
        code,
      };
    default:
      return { ...GENERIC, code };
  }
}

function guessStepFromColumn(haystack: string): 'profile' | 'preferences' | undefined {
  const value = haystack.toLowerCase();

  if (
    value.includes('distance') ||
    value.includes('age_') ||
    value.includes('preferences') ||
    value.includes('denomination') ||
    value.includes('dealbreaker') ||
    value.includes('notify_')
  ) {
    return 'preferences';
  }

  if (
    value.includes('date_of_birth') ||
    value.includes('gender') ||
    value.includes('first_name') ||
    value.includes('last_name') ||
    value.includes('profiles')
  ) {
    return 'profile';
  }

  return undefined;
}

export async function reportError(error: unknown, context: ReportContext = {}): Promise<void> {
  const e = (error ?? {}) as PostgrestLikeError;

  try {
    console.error('[client_error]', context.screen ?? '', context.action ?? '', e);
    await supabase.from('client_errors').insert({
      user_id: context.userId ?? null,
      context: [context.screen, context.action].filter(Boolean).join(' / ') || null,
      pg_code: e.code ?? null,
      message: e.message ?? null,
      details: e.details ?? null,
      hint: e.hint ?? null,
      raw: safeJson(error),
      app: context.app ?? 'consumer',
    });
  } catch {
    // Logging is best-effort and must never interrupt a user flow.
  }
}

function safeJson(value: unknown): Record<string, unknown> | null {
  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return null;
  }
}

export async function handleDbError(
  error: unknown,
  context: ReportContext = {},
): Promise<MappedError> {
  const mapped = mapDbError(error);

  if (mapped.report) {
    await reportError(error, context);
  }

  return mapped;
}
