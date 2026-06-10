import { ICategoryWithTemplates } from 'type/proposalV2.type';

/** 本地联调：跳过模板 has_perm_to_use 校验（.env.local 中 REACT_APP_LOCAL_SKIP_PROPOSAL_PERM=true） */
export const isLocalSkipProposalPerm = () => process.env.REACT_APP_LOCAL_SKIP_PROPOSAL_PERM === 'true';

export const applyLocalProposalPermBypass = (list: ICategoryWithTemplates[]): ICategoryWithTemplates[] => {
  if (!isLocalSkipProposalPerm()) {
    return list;
  }
  return list.map((cat) => ({
    ...cat,
    templates: cat.templates.map((template) => ({
      ...template,
      has_perm_to_use: true,
    })),
  }));
};
