import OneSignal from 'react-onesignal';
import getConfig from './envCofnig';
import { disablePushService } from './envFlags';

export default async function runOneSignal() {
  if (disablePushService()) {
    return;
  }
  const app_id = getConfig().REACT_APP_ONESIGNAL_ID;
  console.log('app_id:', app_id);
  try {
    await OneSignal.init({ appId: app_id });
    OneSignal.Slidedown.promptPush();
  } catch (error) {
    logError('init onesignal error:', error);
  }
}
