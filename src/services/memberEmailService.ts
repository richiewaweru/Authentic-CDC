import { getSlotDataSource } from '../config/env';
import { supabase } from '../config/supabase';

export const EMAIL_TRIGGERS_ENABLED = getSlotDataSource() === 'supabase';

interface BookingCancellationEmailParams {
  userEmail: string;
  firstName: string;
  guideName: string;
  slotDate: string;
  slotTime: string;
}

export function sendBookingCancellationEmail({
  userEmail,
  firstName,
  guideName,
  slotDate,
  slotTime,
}: BookingCancellationEmailParams): Promise<unknown> | null {
  if (!EMAIL_TRIGGERS_ENABLED || !userEmail) {
    return null;
  }

  return supabase.functions.invoke('send-member-email', {
    body: {
      type: 'booking_cancelled',
      userEmail,
      firstName,
      guideName,
      slotDate,
      slotTime,
    },
  });
}
