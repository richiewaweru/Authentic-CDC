import * as fs from 'fs';
import * as path from 'path';

const screenFiles = [
  'src/screens/auth/WelcomeScreen.tsx',
  'src/screens/auth/AuthScreen.tsx',
  'src/screens/onboarding/OnboardingFlow.tsx',
  'src/screens/booking/ProfileReadyScreen.tsx',
  'src/screens/booking/ConversationInfoScreen.tsx',
  'src/screens/booking/ChooseSlotScreen.tsx',
  'src/screens/booking/ConfirmBookingScreen.tsx',
  'src/screens/booking/BookingConfirmedScreen.tsx',
  'src/screens/booking/PendingHomeScreen.tsx',
];

describe('screen layout migration regression', () => {
  it('removes the old full-screen spacing pattern from migrated screens', () => {
    const rootSpaceBetweenPattern = /screen:\s*{[\s\S]*?justifyContent:\s*'space-between'/m;

    for (const file of screenFiles) {
      const source = fs.readFileSync(path.resolve(__dirname, '..', file), 'utf8');

      expect(source).not.toMatch(rootSpaceBetweenPattern);
      expect(source).not.toContain("paddingBottom: Math.max(insets.bottom, 16) + 16");
    }
  });
});
