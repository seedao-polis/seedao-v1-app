import { ICategoryWithTemplates } from 'type/proposalV2.type';

const forceAllTemplatePerms = (list: ICategoryWithTemplates[]): ICategoryWithTemplates[] =>
  list.map((cat) => ({
    ...cat,
    templates: cat.templates.map((template) => ({
      ...template,
      has_perm_to_use: true,
    })),
  }));

/** 本地 .env.local：REACT_APP_LOCAL_SKIP_PROPOSAL_PERM=true */
export const isLocalSkipProposalPerm = () => process.env.REACT_APP_LOCAL_SKIP_PROPOSAL_PERM === 'true';

/** 任意环境构建时可显式开启：REACT_APP_SKIP_PROPOSAL_PERM=true（如 Netlify 环境变量） */
export const isSkipProposalPerm = () =>
  isLocalSkipProposalPerm() || process.env.REACT_APP_SKIP_PROPOSAL_PERM === 'true';

/** @deprecated 使用 applyProposalTemplatePermissions */
export const applyLocalProposalPermBypass = (list: ICategoryWithTemplates[]): ICategoryWithTemplates[] => {
  if (!isLocalSkipProposalPerm()) {
    return list;
  }
  return forceAllTemplatePerms(list);
};

/**
 * 归一化 list_with_perm 响应。
 * 去 Metaforo 后若后端尚未修好 Casbin，可能全部返回 has_perm_to_use=false，此处做迁移期兜底。
 */
export const applyProposalTemplatePermissions = (list: ICategoryWithTemplates[]): ICategoryWithTemplates[] => {
  if (isSkipProposalPerm()) {
    return forceAllTemplatePerms(list);
  }

  const templates = list.flatMap((cat) => cat.templates);
  if (templates.length > 0 && templates.every((template) => template.has_perm_to_use === false)) {
    return forceAllTemplatePerms(list);
  }

  return list;
};
