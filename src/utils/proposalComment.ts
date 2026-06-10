import { IComment } from 'type/proposalV2.type';

/** 兼容后端迁移期仍返回 metaforo_* 字段的响应 */
export const getCommentId = (comment: Pick<IComment, 'comment_id' | 'metaforo_post_id'>): number =>
  comment.comment_id ?? comment.metaforo_post_id ?? 0;

export const getParentCommentId = (comment: Pick<IComment, 'parent_comment_id' | 'reply_metaforo_post_id'>): number =>
  comment.parent_comment_id ?? comment.reply_metaforo_post_id ?? 0;
