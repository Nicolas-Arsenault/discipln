import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { notificationService } from '../services/notificationService';

export const usePermissions = () => {
  const [hasNotificationPermission, setHasNotificationPermission] = useState(false);
  const [isCheckingPermissions, setIsCheckingPermissions] = useState(true);

  const checkPermissions = useCallback(async () => {
    setIsCheckingPermissions(true);
    const hasPermission = await notificationService.requestPermissions();
    setHasNotificationPermission(hasPermission);
    setIsCheckingPermissions(false);
    return hasPermission;
  }, []);

  const requestPermissions = useCallback(async () => {
    const hasPermission = await notificationService.requestPermissions();
    setHasNotificationPermission(hasPermission);
    
    if (!hasPermission) {
      Alert.alert(
        "Permissions Required",
        "This app requires notification permissions to remind you about your activities. Please enable notifications in your device settings.",
        [{ text: "OK" }]
      );
    }
    
    return hasPermission;
  }, []);

  return {
    hasNotificationPermission,
    isCheckingPermissions,
    checkPermissions,
    requestPermissions
  };
};
