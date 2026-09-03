import Notion from '../notion/notion';
import axios from 'axios';
import React, { useEffect, useState } from 'react';

import styled from 'styled-components';
import { AppActionType, useAuthContext } from '../../providers/authProvider';

import { useTranslation } from 'react-i18next';

const ARCHIVE_NOTION_ID = 'f57031667089473faa7ea3560d05960c';
const ARCHIVE_NOTION_URL = `https://seedao.notion.site/SeeDAO-${ARCHIVE_NOTION_ID}`;

const OuterBox = styled.div`
  min-height: 100%;
  padding: 24px;
`;

const Fallback = styled.div`
  max-width: 640px;
  margin: 80px auto;
  text-align: center;
  color: var(--bs-body-color);
  line-height: 1.6;

  a {
    color: var(--bs-primary);
  }
`;

export default function Archive() {
  const [list, setList] = useState(null);
  const [loadFailed, setLoadFailed] = useState(false);

  const { t } = useTranslation();

  const { dispatch } = useAuthContext();

  useEffect(() => {
    getData(ARCHIVE_NOTION_ID);
  }, []);

  const getData = async (articleId: string) => {
    dispatch({ type: AppActionType.SET_LOADING, payload: true });
    setLoadFailed(false);
    try {
      // 旧 Deno Notion 代理已不可用时，页面会走下方外链兜底
      let result = await axios.get(`https://kind-emu-97.deno.dev/page/${articleId}`);
      setList(result.data);
    } catch (error: any) {
      console.error('[archive] notion proxy failed', error);
      setLoadFailed(true);
    } finally {
      dispatch({ type: AppActionType.SET_LOADING, payload: false });
    }
  };

  return (
    <OuterBox>
      {list && <Notion recordMap={list} />}
      {!list && loadFailed && (
        <Fallback>
          <p>{t('menus.archive')} 内容暂时无法在站内加载。</p>
          <p>
            请前往 Notion 查看：
            <a href={ARCHIVE_NOTION_URL} target="_blank" rel="noreferrer">
              {ARCHIVE_NOTION_URL}
            </a>
          </p>
        </Fallback>
      )}
    </OuterBox>
  );
}
