const mockSetNotificationChannelAsync = jest.fn();
const mockGetPermissionsAsync = jest.fn();
const mockRequestPermissionsAsync = jest.fn();
const mockGetExpoPushTokenAsync = jest.fn();

jest.mock('expo-notifications', () => ({
  AndroidImportance: {
    MAX: 'max',
  },
  getExpoPushTokenAsync: (...args: unknown[]) => mockGetExpoPushTokenAsync(...args),
  getPermissionsAsync: (...args: unknown[]) => mockGetPermissionsAsync(...args),
  requestPermissionsAsync: (...args: unknown[]) => mockRequestPermissionsAsync(...args),
  setNotificationChannelAsync: (...args: unknown[]) => mockSetNotificationChannelAsync(...args),
  setNotificationHandler: jest.fn(),
}));

let mockIsDevice = true;
jest.mock('expo-device', () => ({
  get isDevice() {
    return mockIsDevice;
  },
}));

const mockConstants = {
  appOwnership: null as string | null,
  easConfig: { projectId: 'project-123' },
  executionEnvironment: 'standalone',
  expoConfig: {
    extra: {
      eas: {
        projectId: 'project-123',
      },
    },
  },
};

jest.mock('expo-constants', () => ({
  __esModule: true,
  ...mockConstants,
  ExecutionEnvironment: {
    StoreClient: 'storeClient',
    Standalone: 'standalone',
  },
  default: mockConstants,
}));

jest.mock('react-native', () => ({
  Platform: {
    OS: 'android',
  },
}));

const mockUpdateEq = jest.fn();
const mockUpdate = jest.fn(() => ({ eq: mockUpdateEq }));
const mockFrom = jest.fn(() => ({ update: mockUpdate }));

jest.mock('../src/config/supabase', () => ({
  supabase: {
    from: (...args: unknown[]) => mockFrom(...args),
  },
}));

describe('pushNotificationService', () => {
  let registerForPushNotifications: typeof import('../src/services/pushNotificationService').registerForPushNotifications;

  beforeEach(() => {
    jest.resetModules();
    mockIsDevice = true;
    mockConstants.appOwnership = null;
    mockConstants.executionEnvironment = 'standalone';
    mockConstants.expoConfig.extra.eas.projectId = 'project-123';
    mockConstants.easConfig.projectId = 'project-123';
    mockSetNotificationChannelAsync.mockReset().mockResolvedValue(undefined);
    mockGetPermissionsAsync.mockReset();
    mockRequestPermissionsAsync.mockReset();
    mockGetExpoPushTokenAsync.mockReset();
    mockUpdateEq.mockReset().mockResolvedValue({ error: null });
    mockUpdate.mockReset().mockReturnValue({ eq: mockUpdateEq });
    mockFrom.mockReset().mockReturnValue({ update: mockUpdate });

    registerForPushNotifications =
      require('../src/services/pushNotificationService').registerForPushNotifications;
  });

  it('skips token registration on non-physical devices', async () => {
    mockIsDevice = false;

    await registerForPushNotifications('user-1');

    expect(mockGetPermissionsAsync).not.toHaveBeenCalled();
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it('skips token registration in Expo Go style environments', async () => {
    mockConstants.executionEnvironment = 'storeClient';

    await registerForPushNotifications('user-1');

    expect(mockGetPermissionsAsync).not.toHaveBeenCalled();
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it('persists the Expo push token when permission is granted', async () => {
    mockGetPermissionsAsync.mockResolvedValue({ status: 'granted' });
    mockGetExpoPushTokenAsync.mockResolvedValue({ data: 'ExponentPushToken[abc]' });

    await registerForPushNotifications('user-1');

    expect(mockSetNotificationChannelAsync).toHaveBeenCalled();
    expect(mockGetExpoPushTokenAsync).toHaveBeenCalledWith({ projectId: 'project-123' });
    expect(mockFrom).toHaveBeenCalledWith('profiles');
    expect(mockUpdate).toHaveBeenCalledWith({ expo_push_token: 'ExponentPushToken[abc]' });
    expect(mockUpdateEq).toHaveBeenCalledWith('id', 'user-1');
  });

  it('does not write a token when permission is denied', async () => {
    mockGetPermissionsAsync.mockResolvedValue({ status: 'denied' });
    mockRequestPermissionsAsync.mockResolvedValue({ status: 'denied' });

    await registerForPushNotifications('user-1');

    expect(mockGetExpoPushTokenAsync).not.toHaveBeenCalled();
    expect(mockFrom).not.toHaveBeenCalled();
  });
});
