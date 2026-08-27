/** 是否为线上生产构建（Netlify prod: REACT_APP_ENV_VERSION=prod） */
export const isProductionEnv = () => process.env.REACT_APP_ENV_VERSION === 'prod';

/** 线上隐藏：钱包登录入口 */
export const hideWalletLogin = () => isProductionEnv();

/** 线上隐藏：SeeChat */
export const hideSeeChat = () => isProductionEnv();

/** 线上隐藏：发起提案入口 */
export const hideCreateProposal = () => isProductionEnv();

/** 线上隐藏：发表评论 */
export const hidePostComment = () => isProductionEnv();

/** 线上隐藏：SeeU Network（应用卡片与活动页） */
export const hideSeeUNetwork = () => isProductionEnv();

/** 线上禁用：Push 推送（push-api.seedao.tech + OneSignal） */
export const disablePushService = () => isProductionEnv();

/** 线上禁用：SBT 服务（sbt-api.seedao.tech） */
export const disableSbtService = () => isProductionEnv();

/** 线上禁用：SNS 敏感词校验（sns-api.seedao.top） */
export const disableSnsSafeService = () => isProductionEnv();

const PROD_HIDDEN_APP_IDS = new Set(['seeu', 'module-event']);

export const filterAppsForEnv = <T extends { id: string }>(apps: T[]) => {
  if (!hideSeeUNetwork()) {
    return apps;
  }
  return apps.filter((item) => !PROD_HIDDEN_APP_IDS.has(item.id));
};

/** 过滤市政厅治理/技术入口中的 SBT 相关链接 */
export const filterCityHallLinksForEnv = <T extends { link?: string }>(links: T[]) => {
  if (!disableSbtService()) {
    return links;
  }
  return links.filter((item) => !item.link?.startsWith('/sbt/'));
};
