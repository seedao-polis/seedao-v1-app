import styled from 'styled-components';
import { ContainerPadding } from '../assets/styles/global';
import React, { useMemo } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import Links from 'utils/links';
import AppCard from 'components/common/appCard';
import { filterAppsForEnv } from 'utils/envFlags';

const OuterBox = styled.div`
  min-height: 100%;
  ${ContainerPadding};
`;

export default function Apps() {
  const { t } = useTranslation();

  const events = useMemo(() => {
    // @ts-ignore
    return filterAppsForEnv(Links.apps).map((item) => ({
      ...item,
      name: t(item.name) as string,
      desc: t(item.desc) as string,
    }));
  }, [t]);

  return (
    <OuterBox>
      <AppBox>
        {events.map((item, idx) => (
          <Col key={idx} sm={12} md={6} lg={4} xl={3}>
            <AppCard {...item} />
          </Col>
        ))}
      </AppBox>
    </OuterBox>
  );
}

const AppBox = styled(Row)`
  padding-bottom: 20px;

  div[class^='col'] {
    min-height: 116px;
    display: flex;
    margin-bottom: 24px;
  }
  .link {
    display: none !important;
  }
`;
