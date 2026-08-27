import { normalize } from '@seedao2.0/sns-namehash';
import { resolve as apiResolve, isSafe } from '@seedao2.0/sns-api';
import getConfig from './envCofnig';
import { disableSnsSafeService } from './envFlags';

const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000';
const PUBLIC_RESOLVER_ADDR = '0x64b7CbacE440808C8d71bb62E80A655331ABe092';

const getIndexerHost = () => getConfig().INDEXER_ENDPOINT;
const getSafeHost = () =>
  (getConfig() as { SNS_SAFE_HOST?: string }).SNS_SAFE_HOST || 'https://sns-api.seedao.top';

const resolveOne = async (snsName: string, rpc: string) => {
  if (!snsName.length) {
    return ADDRESS_ZERO;
  }
  const [ok, name] = normalize(snsName);
  if (!ok) {
    return ADDRESS_ZERO;
  }
  if (!disableSnsSafeService()) {
    if (!(await isSafe(name, getSafeHost()))) {
      return ADDRESS_ZERO;
    }
  }
  return apiResolve(name, getIndexerHost(), rpc, PUBLIC_RESOLVER_ADDR);
};

/** 使用 envCofnig 中的 INDEXER / SNS Safe 地址解析 SNS */
export const resolveSns = async (snsName: string, rpc?: string) => {
  const rpcUrl = rpc ?? getConfig().NETWORK.rpcs[0];
  return resolveOne(snsName, rpcUrl);
};

export const resolveSnsList = async (snsNames: string[], rpc?: string) => {
  const rpcUrl = rpc ?? getConfig().NETWORK.rpcs[0];
  const unique = Array.from(new Set(snsNames));
  return Promise.all(unique.map((name) => resolveOne(name, rpcUrl)));
};

export const getSnsSafeHost = () => getSafeHost();
