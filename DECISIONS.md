# Decisions

## Guided Journey Path rollout

- The consumer app keeps its existing data model and navigation boundaries: seven onboarding profile steps, followed by the separate booking flow for the Alignment Conversation.
- The approved design's nine-step journey is represented conceptually across those existing boundaries:
  - App welcome screen: dark hero and fellowship icon.
  - Seven onboarding profile steps: journey path, eyebrow labels, symbolic icons where specified, profile form without an icon, choice cards, and staggered section entrances.
  - Booking schedule screen: step 8 journey marker, guide card, date selection, and animated time-slot entrance.
  - Booking confirmation screen: step 9 journey marker, dark hero, rose-gold warmth, and one-time checkmark shimmer.
- This avoids a migration-heavy rewrite of onboarding persistence, validation schemas, tests, and saved-progress recovery while still matching the member-facing guided journey direction.
- Admin surfaces remain unchanged except for shared brand tokens, per the design brief.
