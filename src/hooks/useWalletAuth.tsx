import { AppActionType, useAuthContext } from 'providers/authProvider';
import useCheckLogin from 'hooks/useCheckLogin';

/**
 * 提案相关操作仅需钱包登录（Seedao JWT），不再依赖 Metaforo。
 */
export default function useWalletAuth() {
  const {
    state: { account, userData },
    dispatch,
  } = useAuthContext();

  const isLogin = useCheckLogin(account);

  const ensureWalletLogin = async (): Promise<boolean> => {
    if (!isLogin || !account || !userData) {
      dispatch({ type: AppActionType.SET_LOGIN_MODAL, payload: true });
      return false;
    }
    return true;
  };

  return { ensureWalletLogin, isLogin };
}
