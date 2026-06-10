import { IProposal, Poll, VoteOption, VoteOptionType } from 'type/proposalV2.type';

const STANDARD_VOTE_LABELS = new Set([
  '通过',
  '不通过',
  '赞成',
  '反对',
  'Pass',
  'Fail',
  'Yes',
  'No',
  'For',
  'Against',
  'Approve',
  'Reject',
]);

export const stripVoteOptionHtml = (html: string): string => html.replace(/<[^>]*>/g, '').trim();

/** 是否为标准赞成/反对两项（vote_type 应为 1） */
export const isStandardPassFailOptions = (options: { html: string }[]): boolean => {
  if (options.length !== 2) {
    return false;
  }
  return options.every((option) => STANDARD_VOTE_LABELS.has(stripVoteOptionHtml(option.html)));
};

/** vote_type 为 98/99 时，仅当选项文案确为自定义内容才展示「自定义 A/B」前缀 */
export const shouldShowCustomVoteLabels = (
  voteType: VoteOptionType | undefined,
  options: { html: string }[],
): boolean => {
  if (voteType !== 98 && voteType !== 99) {
    return false;
  }
  return !isStandardPassFailOptions(options);
};

const toVoteFlag = (value: unknown): 0 | 1 => {
  if (value === 1 || value === true || value === '1' || value === 'true') {
    return 1;
  }
  return 0;
};

const readProposalIsVoted = (proposal: IProposal): 0 | 1 => {
  const raw = proposal as IProposal & {
    is_voted?: unknown;
    has_voted?: unknown;
    voted?: unknown;
  };
  if (toVoteFlag(raw.is_voted) || toVoteFlag(raw.has_voted) || toVoteFlag(raw.voted)) {
    return 1;
  }
  return 0;
};

const getVotedOptionIds = (poll: Poll, proposal: IProposal): number[] => {
  const pollIds = (poll as { voted_option_ids?: number[] }).voted_option_ids;
  const proposalIds = (proposal as { voted_option_ids?: number[] }).voted_option_ids;
  const source = Array.isArray(pollIds) ? pollIds : Array.isArray(proposalIds) ? proposalIds : [];
  return source.map((id) => Number(id)).filter((id) => !Number.isNaN(id));
};

const normalizePoll = (poll: Poll, proposal: IProposal, proposalIsVoted: 0 | 1): Poll => {
  const votedOptionIds = new Set(getVotedOptionIds(poll, proposal));
  let pollIsVote = toVoteFlag(poll.is_vote);

  const options: VoteOption[] = poll.options.map((option) => {
    let optionIsVote = toVoteFlag(option.is_vote);
    if (!optionIsVote && votedOptionIds.has(option.id)) {
      optionIsVote = 1;
    }
    return { ...option, is_vote: optionIsVote };
  });

  if (!pollIsVote && options.some((option) => option.is_vote === 1)) {
    pollIsVote = 1;
  }

  if (!pollIsVote && proposalIsVoted) {
    pollIsVote = 1;
  }

  return {
    ...poll,
    is_vote: pollIsVote,
    options,
  };
};

/** 兼容后端 is_voted / is_vote 字段不一致，统一为 Poll 与 VoteOption 的 0|1 标记 */
export const normalizeProposalVotes = (proposal: IProposal): IProposal => {
  if (!proposal?.votes?.length) {
    return proposal;
  }

  const proposalIsVoted =
    readProposalIsVoted(proposal) || proposal.votes.some((poll) => toVoteFlag(poll.is_vote) === 1);
  const votes = proposal.votes.map((poll) => normalizePoll(poll, proposal, proposalIsVoted ? 1 : 0));

  return {
    ...proposal,
    is_voted: proposalIsVoted === 1,
    votes,
  };
};

export const applyOptimisticVote = (proposal: IProposal, votedOptionIds: number[]): IProposal => {
  if (!proposal?.votes?.length || !votedOptionIds.length) {
    return proposal;
  }

  const votedIdSet = new Set(votedOptionIds.map((id) => Number(id)));
  const votes = proposal.votes.map((poll, index) => {
    if (index !== 0) {
      return poll;
    }

    const options = poll.options.map((option) => ({
      ...option,
      is_vote: votedIdSet.has(option.id) ? 1 : option.is_vote,
    }));

    return {
      ...poll,
      is_vote: 1 as const,
      options,
    };
  });

  return normalizeProposalVotes({
    ...proposal,
    is_voted: true,
    votes,
  });
};

export const hasUserVoted = (proposal?: IProposal | null): boolean => {
  if (!proposal) {
    return false;
  }
  if (readProposalIsVoted(proposal)) {
    return true;
  }
  return !!proposal.votes?.some(
    (poll) => toVoteFlag(poll.is_vote) === 1 || poll.options?.some((option) => toVoteFlag(option.is_vote) === 1),
  );
};

/** 后端未返回具体选项时，至少标记用户已投票，避免继续展示投票表单 */
export const markProposalAsVoted = (proposal: IProposal): IProposal => {
  if (!proposal.votes?.length) {
    return { ...proposal, is_voted: true };
  }

  const votes = proposal.votes.map((poll, index) =>
    index === 0 ? { ...poll, is_vote: 1 as const } : poll,
  );

  return normalizeProposalVotes({
    ...proposal,
    is_voted: true,
    votes,
  });
};

export const isAlreadyVotedError = (error: unknown): boolean => {
  const payload = (error as { data?: Record<string, unknown> })?.data ?? (error as Record<string, unknown>);
  const code = payload?.code;
  const msg = String(payload?.msg ?? '').toLowerCase();
  return (
    code === 409 ||
    msg.includes('already') ||
    msg.includes('已投') ||
    msg.includes('重复') ||
    msg.includes('duplicate')
  );
};
