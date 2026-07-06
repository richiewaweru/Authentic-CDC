import { supabase } from '../config/supabase';

export type AnnouncementTone = 'info' | 'celebration' | 'reminder' | 'alert';
export type ReadingCategory = 'Faith' | 'Relationships' | 'Community' | 'General';

export interface CommunityEvent {
  id: string;
  title: string;
  description: string | null;
  eventDate: string;
  durationMinutes: number;
  location: string | null;
  meetingLink: string | null;
  coverImageUrl: string | null;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  tone: AnnouncementTone;
  pinned: boolean;
  createdAt: string;
  expiresAt: string | null;
}

export interface Reading {
  id: string;
  title: string;
  body: string | null;
  externalUrl: string | null;
  category: ReadingCategory;
  publishedAt: string | null;
  createdAt: string;
}

export interface CommunityProfile {
  id: string;
  displayName: string | null;
  avatarUrl: string | null;
  cityState: string | null;
  bio: string | null;
  gender: string | null;
}

export interface ActiveGuide {
  id: string;
  name: string;
  title: string;
  avatarUrl: string | null;
  initials: string;
  bio: string | null;
}

export interface UpdateProfileInput {
  displayName: string | null;
  avatarUrl: string | null;
  cityState: string | null;
  bio: string | null;
}

function mapEvent(row: Record<string, any>): CommunityEvent {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? null,
    eventDate: row.event_date,
    durationMinutes: row.duration_minutes ?? 60,
    location: row.location ?? null,
    meetingLink: row.meeting_link ?? null,
    coverImageUrl: row.cover_image_url ?? null,
  };
}

function mapAnnouncement(row: Record<string, any>): Announcement {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    tone: row.tone,
    pinned: Boolean(row.pinned),
    createdAt: row.created_at,
    expiresAt: row.expires_at ?? null,
  };
}

function mapReading(row: Record<string, any>): Reading {
  return {
    id: row.id,
    title: row.title,
    body: row.body ?? null,
    externalUrl: row.external_url ?? null,
    category: row.category,
    publishedAt: row.published_at ?? null,
    createdAt: row.created_at,
  };
}

function throwLoadError(error: unknown, fallback: string): never {
  console.error(fallback, error);
  throw new Error(fallback);
}

export async function getAnnouncements(): Promise<Announcement[]> {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('announcements')
    .select('id, title, body, tone, pinned, created_at, expires_at')
    .eq('published', true)
    .or(`expires_at.is.null,expires_at.gt.${now}`)
    .order('pinned', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    throwLoadError(error, 'Could not load announcements.');
  }

  return (data ?? []).map(mapAnnouncement);
}

export async function getUpcomingEvents(limit = 2): Promise<CommunityEvent[]> {
  const { data, error } = await supabase
    .from('community_events')
    .select('id, title, description, event_date, duration_minutes, location, meeting_link, cover_image_url')
    .eq('published', true)
    .gte('event_date', new Date().toISOString())
    .order('event_date', { ascending: true })
    .limit(limit);

  if (error) {
    throwLoadError(error, 'Could not load upcoming events.');
  }

  return (data ?? []).map(mapEvent);
}

export async function getEvents(): Promise<CommunityEvent[]> {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);

  const { data, error } = await supabase
    .from('community_events')
    .select('id, title, description, event_date, duration_minutes, location, meeting_link, cover_image_url')
    .eq('published', true)
    .gte('event_date', cutoff.toISOString())
    .order('event_date', { ascending: true });

  if (error) {
    throwLoadError(error, 'Could not load events.');
  }

  return (data ?? []).map(mapEvent);
}

export async function getEventById(id: string): Promise<CommunityEvent | null> {
  const { data, error } = await supabase
    .from('community_events')
    .select('id, title, description, event_date, duration_minutes, location, meeting_link, cover_image_url')
    .eq('id', id)
    .single();

  if (error) {
    throwLoadError(error, 'Could not load this event.');
  }

  return data ? mapEvent(data) : null;
}

export async function getReadings(category?: ReadingCategory | 'All'): Promise<Reading[]> {
  let query = supabase
    .from('community_readings')
    .select('id, title, body, external_url, category, published_at, created_at')
    .eq('published', true)
    .order('published_at', { ascending: false, nullsFirst: false });

  if (category && category !== 'All') {
    query = query.eq('category', category);
  }

  const { data, error } = await query;

  if (error) {
    throwLoadError(error, 'Could not load readings.');
  }

  return (data ?? []).map(mapReading);
}

export async function getReadingById(id: string): Promise<Reading | null> {
  const { data, error } = await supabase
    .from('community_readings')
    .select('id, title, body, external_url, category, published_at, created_at')
    .eq('id', id)
    .single();

  if (error) {
    throwLoadError(error, 'Could not load this reading.');
  }

  return data ? mapReading(data) : null;
}

export async function getMyProfile(userId: string): Promise<CommunityProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, display_name, avatar_url, city_state, bio, gender')
    .eq('id', userId)
    .single();

  if (error) {
    throwLoadError(error, 'Could not load your profile.');
  }

  return data
    ? {
        id: data.id,
        displayName: data.display_name ?? null,
        avatarUrl: data.avatar_url ?? null,
        cityState: data.city_state ?? null,
        bio: data.bio ?? null,
        gender: data.gender ?? null,
      }
    : null;
}

export async function updateMyProfile(userId: string, input: UpdateProfileInput): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({
      display_name: input.displayName,
      avatar_url: input.avatarUrl,
      city_state: input.cityState,
      bio: input.bio,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (error) {
    throwLoadError(error, 'Could not update your profile.');
  }
}

export async function getActiveGuides(): Promise<ActiveGuide[]> {
  const { data, error } = await supabase
    .from('guide_profiles')
    .select('id, name, display_name, title, avatar_url, initials, bio')
    .eq('is_active', true)
    .order('display_name', { ascending: true });

  if (error) {
    throwLoadError(error, 'Could not load community guides.');
  }

  return (data ?? []).map((row) => {
    const name = row.display_name || row.name || 'Community Guide';
    return {
      id: row.id,
      name,
      title: row.title || 'Community Guide',
      avatarUrl: row.avatar_url ?? null,
      initials: row.initials || buildInitials(name),
      bio: row.bio ?? null,
    };
  });
}

export function buildCommunityCalendarUrl(event: CommunityEvent): string {
  const start = new Date(event.eventDate);
  const end = new Date(start.getTime() + event.durationMinutes * 60 * 1000);
  const fmt = (date: Date) => date.toISOString().replace(/[-:.]/g, '').slice(0, 15) + 'Z';

  const qs = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${fmt(start)}/${fmt(end)}`,
    details: event.description ?? 'Authentic CDC community event.',
    location: event.location ?? 'Authentic CDC',
  });

  return `https://calendar.google.com/calendar/render?${qs.toString()}`;
}

function buildInitials(name: string) {
  return name
    .split(/[\s._-]+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}
