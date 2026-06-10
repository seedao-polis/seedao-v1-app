import styled from 'styled-components';
import BasicModal from './basicModal';
import DefaultAvatar from 'assets/Imgs/defaultAvatarT.png';
import { useTranslation } from 'react-i18next';
import { useCallback, useEffect, useState } from 'react';
import { getVotersOfOption, VoterType } from 'requests/proposalV2';
import InfiniteScroll from 'react-infinite-scroll-component';
import { AppActionType, useAuthContext } from 'providers/authProvider';
import useToast, { ToastType } from 'hooks/useToast';
import publicJs from 'utils/publicJs';
import useQuerySNS from 'hooks/useQuerySNS';
import { formatApiError } from 'utils/formatApiError';

const mergeVoters = (prev: VoterType[], next: VoterType[]): VoterType[] => {
  const seen = new Set(prev.map((item) => item.wallet?.toLowerCase()));
  const merged = [...prev];
  next.forEach((item) => {
    const key = item.wallet?.toLowerCase();
    if (!key || seen.has(key)) {
      return;
    }
    seen.add(key);
    merged.push(item);
  });
  return merged;
};

interface IUserProps {
  name: string;
  avatar: string;
}

const UserBox = ({ name, avatar }: IUserProps) => {
  return (
    <UserBoxStyle>
      <Avatar src={avatar || DefaultAvatar} alt="" />
      <span>{name}</span>
    </UserBoxStyle>
  );
};

interface IProps {
  optionId: number;
  count: number;
  onClose: () => void;
}

export default function VoterListModal({ optionId, count, onClose }: IProps) {
  const { t } = useTranslation();
  const {
    dispatch,
    state: { snsMap },
  } = useAuthContext();
  const [page, setPage] = useState(1);
  const [list, setList] = useState<VoterType[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const { showToast } = useToast();
  const { getMultiSNS } = useQuerySNS();

  const getList = useCallback(() => {
    dispatch({ type: AppActionType.SET_LOADING, payload: true });
    getVotersOfOption(optionId, page)
      .then((res) => {
        const records = res.data ?? [];
        setList((prev) => {
          const merged = mergeVoters(prev, records);
          const grew = merged.length > prev.length;
          setHasMore(records.length > 0 && grew && merged.length < count);
          return merged;
        });
        setPage((p) => p + 1);
        if (records.length) {
          getMultiSNS(Array.from(new Set(records.map((item) => item.wallet))));
        }
      })
      .catch((err: unknown) => {
        showToast(formatApiError(err), ToastType.Danger);
        setHasMore(false);
      })
      .finally(() => {
        dispatch({ type: AppActionType.SET_LOADING, payload: false });
      });
  }, [count, dispatch, getMultiSNS, optionId, page, showToast]);

  useEffect(() => {
    setPage(1);
    setList([]);
    setHasMore(count > 0);
  }, [count, optionId]);

  useEffect(() => {
    if (page === 1 && list.length === 0 && count > 0) {
      getList();
    }
  }, [count, getList, list.length, page]);

  const formatSNS = (wallet: string) => {
    const name = snsMap.get(wallet) || wallet;
    return name?.endsWith('.seedao') ? name : publicJs.AddressToShow(name, 4);
  };

  return (
    <VotersModal handleClose={onClose}>
      <TopCount>{t('Proposal.TotalVoteCount', { count })}</TopCount>
      <List id="voter-modal">
        <InfiniteScroll
          scrollableTarget="voter-modal"
          dataLength={list.length}
          next={getList}
          hasMore={hasMore}
          loader={<></>}
        >
          {list.slice(0, count).map((item, index) => (
            <li key={`${item.wallet}-${index}`}>
              <UserBox name={formatSNS(item.wallet?.toLocaleLowerCase())} avatar={item.os_avatar} />
              <span>{item.weight}</span>
            </li>
          ))}
        </InfiniteScroll>
      </List>
    </VotersModal>
  );
}

const VotersModal = styled(BasicModal)`
  width: 540px;
  color: var(--bs-body-color_active);
`;

const List = styled.ul`
  height: 300px;
  overflow-y: auto;
  &::-webkit-scrollbar {
    display: none;
    width: 0;
  }
  li {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-block: 24px;
  }
  span {
    font-size: 14px;
    font-style: normal;
    font-weight: 600;
    line-height: 22px;
  }
`;

const UserBoxStyle = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

export const Avatar = styled.img`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  object-fit: cover;
  object-position: center;
`;

const TopCount = styled.div`
  padding-bottom: 8px;
  font-size: 16px;
  font-style: normal;
  font-weight: 600;
  line-height: 22px;
  border-bottom: 1px solid var(--bs-border-color);
`;
