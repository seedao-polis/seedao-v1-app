import { useState, useEffect, useMemo } from 'react';
import { disablePushService } from 'utils/envFlags';

const checkNotificationSupport = () => {
  if (!window.Notification) {
    logError('not support navigator');
    return;
  }
  return true;
};

const askPermission = () => {
  return new Promise(function (resolve, reject) {
    const permissionResult = Notification.requestPermission(function (result) {
      resolve(result);
    });

    if (permissionResult) {
      permissionResult.then(resolve, reject);
    }
  }).then(function (permissionResult) {
    if (permissionResult !== 'granted') {
      throw new Error("We weren't granted permission.");
    }
  });
};

export default function usePushPermission() {
  const [permission, setPermission] = useState('default');
  const pushDisabled = disablePushService();

  useEffect(() => {
    // 线上已禁用 Push / OneSignal，不再弹浏览器「显示通知」授权
    if (pushDisabled || !checkNotificationSupport()) {
      return;
    }

    const handlePermission = (permission: string) => {
      setPermission(permission);
    };

    Notification.requestPermission()
      .then(handlePermission)
      .catch((err) => logError('permission failed', err));
  }, [pushDisabled]);

  const handlePermission = () => {
    if (pushDisabled) {
      return Promise.resolve();
    }
    if (!checkNotificationSupport()) {
      return Promise.reject('not support navigator');
    }
    return askPermission()
      .then((res) => {
        console.log('you agreed permission');
        setPermission('granted');
      })
      .catch((err) => {
        logError('you denied permission');
      });
  };

  const hasGranted = useMemo(
    () => pushDisabled || permission === 'granted',
    [pushDisabled, permission],
  );

  return { handlePermission, hasGranted };
}
