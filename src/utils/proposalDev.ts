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

export const applyProposalTemplatePermissions = (list: ICategoryWithTemplates[]): ICategoryWithTemplates[] => {
  if (isLocalSkipProposalPerm()) {
    return forceAllTemplatePerms(list);
  }
  return list;
};
