export interface MockUser {
  id: string;
  email: string;
  displayName: string;
}

const demoUser: MockUser = {
  id: 'user_001',
  email: 'testuser@authentic.app',
  displayName: 'Test User',
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockSignUp = async (method: 'apple' | 'google' | 'email') => {
  await delay(800);
  return {
    ...demoUser,
    displayName: method === 'email' ? 'Faithful Friend' : demoUser.displayName,
  };
};

export const mockSignIn = async () => {
  await delay(800);
  return demoUser;
};

export const mockGetSession = async () => {
  await delay(250);
  return null as MockUser | null;
};
