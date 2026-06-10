import request, { ResponseData } from './http';
import {
  IProposal,
  ISimpleProposal,
  ProposalState,
  IContentBlock,
  IBaseCategory,
  IActivity,
  ICategoryWithTemplates,
} from 'type/proposalV2.type';
import { v4 as uuidv4 } from 'uuid';

const PATH_PREFIX = '/proposals/';

interface IProposalPageParams extends IPageParams {
  category_id?: number;
  state?: ProposalState;
  q?: string;
  sip?: number | string;
}

export const getProposalCategoryList = (): Promise<ResponseData<IBaseCategory[]>> => {
  return request.get(`/proposal_categories/list`);
};

export const getAuthProposalCategoryList = (): Promise<ResponseData<IBaseCategory[]>> => {
  return request.get(`/proposal_categories/list_with_perm`);
};

export const getProposalList = (data: IProposalPageParams): Promise<ResponseData<IPageResponse<ISimpleProposal>>> => {
  return request.get(`${PATH_PREFIX}list`, data);
};

export const getMyProposalList = (
  data: IProposalPageParams,
  isPendingSubmit?: boolean,
): Promise<ResponseData<IPageResponse<ISimpleProposal>>> => {
  return request.get(`${PATH_PREFIX}my`, { ...data, pending_submit: isPendingSubmit ? 1 : undefined });
};

export const getProposalDetail = (id: number, startCommentId?: number): Promise<ResponseData<IProposal>> => {
  return request.get(
    `${PATH_PREFIX}show/${id}`,
    {
      start_comment_id: startCommentId,
      // 迁移期兼容旧后端参数名
      start_post_id: startCommentId,
    },
    {},
  );
};

export const getCloseProposal = (
  id: number,
): Promise<
  ResponseData<
    {
      id: number;
      title: string;
    }[]
  >
> => {
  return request.get(
    `${PATH_PREFIX}creating_project_proposals`,
    {
      category_id: id,
    },
    {},
  );
};

type CreateProposalParamsType = {
  title: string;
  is_multiple_vote?: boolean;
  proposal_category_id: number | undefined;
  vote_type?: number | undefined;
  create_project_proposal_id?: any;
  template_id?: number | string;
  vote_options?: string[] | null;
  content_blocks: IContentBlock[];
  submit: boolean;
  components: any;
};

export const getUserActivities = (
  size: number,
  session?: string,
): Promise<ResponseData<{ records: IActivity[]; session: string }>> => {
  return request
    .get('/user/proposal_activities', { size, session })
    .catch(() => request.get('/user/metaforo_activities', { size, session }));
};

/** @deprecated 使用 getUserActivities */
export const getUserActions = getUserActivities;

export const saveOrSubmitProposal = (data: CreateProposalParamsType): Promise<ResponseData<IProposal>> => {
  return request.post(`${PATH_PREFIX}create`, {
    ...data,
    // 迁移期兼容尚未改字段名的后端
    submit_to_metaforo: data.submit,
  });
};

export const updateProposal = (id: number, data: CreateProposalParamsType): Promise<ResponseData<IProposal>> => {
  return request.post(`${PATH_PREFIX}update/${id}`, {
    ...data,
    submit_to_metaforo: data.submit,
  });
};

export const withdrawProposal = (id: number) => {
  return request.post(`${PATH_PREFIX}withdraw/${id}`);
};

// =========== vote ===========

export const checkCanVote = (id: number): Promise<ResponseData<boolean>> => {
  return request.post(`${PATH_PREFIX}can_vote/${id}`);
};

export const castVote = (id: number, vote_id: number, option: number[]) => {
  return request.post(`${PATH_PREFIX}vote/${id}`, {
    vote_id,
    options: option,
  });
};

export const closeVote = (id: number, vote_id: number) => {
  return request.post(`${PATH_PREFIX}close_vote/${id}`, {
    vote_id,
  });
};

export type VoterType = {
  wallet: string;
  os_avatar: string;
  weight: number;
};

export const getVotersOfOption = (option_id: number, page: number): Promise<ResponseData<VoterType[]>> => {
  return request.get(`${PATH_PREFIX}vote_detail/${option_id}`, {
    page,
  });
};

// =========== comment ===========

export const addComment = (id: number, content: string, parent_comment_id?: number) => {
  return request.post(`${PATH_PREFIX}add_comment/${id}`, {
    content,
    parent_comment_id,
    reply_id: parent_comment_id,
    editor_type: 0,
  });
};

export const editCommet = (id: number, content: string, comment_id: number) => {
  return request.post(`${PATH_PREFIX}edit_comment/${id}`, {
    comment_id,
    post_id: comment_id,
    content,
    editor_type: 0,
  });
};

export const deleteCommet = (id: number, comment_id: number) => {
  return request.post(`${PATH_PREFIX}delete_comment/${id}`, {
    comment_id,
    post_id: comment_id,
  });
};

// =========== review ===========

export const approveProposal = (id: number) => {
  return request.post(`${PATH_PREFIX}approve/${id}`, {});
};

export const rejectProposal = (id: number, reason: string) => {
  return request.post(`${PATH_PREFIX}reject/${id}`, {
    reason,
  });
};

export const getTemplate = () => {
  return request.get('/proposal_tmpl/');
};
export const getComponents = () => {
  return request.get('/proposal_components/');
};

export const getTemplates = (): Promise<ResponseData<ICategoryWithTemplates[]>> => {
  return request.get('/proposal_tmpl/list_with_perm');
};

export const UploadPictures = async (file: File) => {
  const blob = new Blob([file], { type: file.type });

  const params = new URLSearchParams();
  params.append('bucket', 'seedao-os-superapp');

  const parts = file.name.split('.');

  const extension = parts[parts.length - 1];
  params.append('filename', `/proposal_images/${uuidv4()}.${extension}`);
  params.append('type', file.type);

  let rt = await request.get(`/url_for_uploading_s3?${params.toString()}`);

  let fileRt = await fetch((rt as any).data, {
    method: 'PUT',
    headers: {
      'Content-Type': file.type,
    },
    body: blob,
  });
  if (fileRt.status === 200) {
    return rt.data.split('?')[0];
  }
};
