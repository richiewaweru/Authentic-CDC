import { Alert, Platform } from 'react-native';

interface ConfirmDialogOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

function buildWebDialogMessage(title: string, message: string) {
  return `${title}\n\n${message}`;
}

export function showInfoDialog(title: string, message: string, onPress?: () => void) {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    window.alert(buildWebDialogMessage(title, message));
    onPress?.();
    return;
  }

  Alert.alert(
    title,
    message,
    onPress
      ? [
          {
            text: 'OK',
            onPress,
          },
        ]
      : undefined,
  );
}

export function showErrorDialog(title: string, message: string) {
  showInfoDialog(title, message);
}

export function confirmDialog({
  title,
  message,
  confirmText = 'OK',
  cancelText = 'Cancel',
}: ConfirmDialogOptions): Promise<boolean> {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return Promise.resolve(window.confirm(buildWebDialogMessage(title, message)));
  }

  return new Promise((resolve) => {
    Alert.alert(title, message, [
      {
        text: cancelText,
        style: 'cancel',
        onPress: () => resolve(false),
      },
      {
        text: confirmText,
        style: 'destructive',
        onPress: () => resolve(true),
      },
    ]);
  });
}
