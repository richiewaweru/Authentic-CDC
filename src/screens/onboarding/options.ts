import { SelectOption } from '../../components/ui/SingleSelect';

export const overviewSections = [
  {
    iconName: 'heart-outline' as const,
    title: 'Relationship Intentions',
    subtitle: 'The heart behind your search',
  },
  {
    iconName: 'chatbubble-ellipses-outline' as const,
    title: 'Communication & Growth',
    subtitle: 'How you connect and navigate depth',
  },
  {
    iconName: 'leaf-outline' as const,
    title: 'Lifestyle & Fellowship',
    subtitle: 'Daily rhythms and community',
  },
  {
    iconName: 'book-outline' as const,
    title: 'Faith Foundation',
    subtitle: 'Your spiritual beliefs and practice',
  },
  {
    iconName: 'compass-outline' as const,
    title: 'Future Vision',
    subtitle: 'Long-term aspirations and goals',
  },
  {
    iconName: 'options-outline' as const,
    title: 'Preferences',
    subtitle: 'Practical alignment settings',
  },
];

export const relationshipGoals: SelectOption[] = [
  { label: 'Friendship first', value: 'Friendship first' },
  { label: 'Intentional dating', value: 'Intentional dating' },
  { label: 'Long-term relationship', value: 'Long-term relationship' },
  { label: 'Marriage-focused relationship', value: 'Marriage-focused relationship' },
];

export const spouseQualities = [
  'Spiritual maturity',
  'Kindness',
  'Honesty',
  'Emotional steadiness',
  'Family-minded',
  'Service',
  'Patience',
  'Ambition',
  'Humor',
  'Humility',
];

export const communicationStyles: SelectOption[] = [
  { label: 'Calm & reflective', value: 'Calm & reflective' },
  { label: 'Direct & honest', value: 'Direct & honest' },
  { label: 'Open & expressive', value: 'Open & expressive' },
  { label: 'Reserved at first', value: 'Reserved at first' },
  { label: 'Playful & lighthearted', value: 'Playful & lighthearted' },
];

export const conflictStyles: SelectOption[] = [
  { label: 'I prefer calm discussion', value: 'I prefer calm discussion' },
  { label: 'I need time to process', value: 'I need time to process' },
  { label: 'I value direct honesty', value: 'I value direct honesty' },
  { label: 'I avoid conflict at first', value: 'I avoid conflict at first' },
  { label: 'I seek prayer patience and clarity', value: 'I seek prayer patience and clarity' },
];

export const lifestyleVisions: SelectOption[] = [
  { label: 'Faith-centered family', value: 'Faith-centered family' },
  { label: 'Ministry & service', value: 'Ministry & service' },
  { label: 'Quiet peaceful home', value: 'Quiet peaceful home' },
  { label: 'Community & hospitality', value: 'Community & hospitality' },
  { label: 'Career and calling', value: 'Career and calling' },
  { label: 'Adventure and growth', value: 'Adventure and growth' },
];

export const sharedActivities = [
  'Bible study',
  'Church events',
  'Volunteering',
  'Outdoors',
  'Cooking',
  'Fitness',
  'Music',
  'Travel',
  'Family time',
  'Deep conversations',
];

export const sharedFaithOptions: SelectOption[] = [
  { label: 'Essential', value: 'Essential' },
  { label: 'Very important', value: 'Very important' },
  { label: 'Somewhat important', value: 'Somewhat important' },
  { label: 'Still exploring', value: 'Still exploring' },
];

export const churchInvolvementOptions: SelectOption[] = [
  { label: 'Weekly active', value: 'Weekly active' },
  { label: 'Regular attendance', value: 'Regular attendance' },
  { label: 'Occasional attendance', value: 'Occasional attendance' },
  { label: 'Still growing spiritually', value: 'Still growing spiritually' },
];

export const faithStarterTags = [
  'Prayer',
  'Accountability',
  'Shared values',
  'Serving together',
  'Spiritual growth',
];

export const futureValueChips = [
  'Peace',
  'Spiritual growth',
  'Honesty',
  'Family',
  'Purpose',
  'Friendship',
  'Service',
];

export const denominationOptions = [
  'Non-denominational',
  'Baptist',
  'Catholic',
  'Methodist',
  'Pentecostal',
  'Presbyterian',
  'Anglican',
  'Lutheran',
];

export const smokingOptions = ['Dealbreaker', 'Prefer no', 'Open'];
export const childrenOptions = ['Want kids', 'Open to kids', "Don't want"];
export const churchOptions = ['Must be active', 'Prefer active', 'Open'];
export const politicalOptions = ['Must align', 'Prefer similar', 'Not important'];
