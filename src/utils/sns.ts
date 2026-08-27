import snsBase from '@seedao2.0/sns-js';
import { resolveSns, resolveSnsList } from './snsClient';

/** 统一 SNS SDK 入口：线上跳过 sns-api 敏感词校验 */
const sns = {
  resolve: resolveSns,
  resolves: resolveSnsList,
  name: snsBase.name.bind(snsBase),
  names: snsBase.names.bind(snsBase),
  tokenId: snsBase.tokenId.bind(snsBase),
};

export default sns;
export { builtin } from '@seedao2.0/sns-js';
