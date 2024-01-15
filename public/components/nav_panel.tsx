/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useMemo } from 'react';
import { EuiSideNav, EuiPageSideBar, htmlIdGenerator, OuiSideNav } from '@elastic/eui';
import { generatePath, Link, matchPath, useLocation } from 'react-router-dom';

import { ROUTES } from '../../common/router';

export function NavPanel() {
  const location = useLocation();
  const items = useMemo(
    () => [
      {
        name: 'Machine Learning',
        id: htmlIdGenerator('machine-learning')(),
        items: ROUTES.filter((item) => !!item.label && item.nav).map((item) => {
          const href = generatePath(item.path);
          return {
            id: href,
            name: item.label,
            href,
            isSelected:
              matchPath(location.pathname, { path: item.path, exact: item.exact }) !== null,
          };
        }),
      },
    ],
    [location.pathname]
  );
  const renderItem = useCallback((item) => {
    if (!item.href) {
      return item.children;
    }
    const { href, ...restProps } = item;
    return <Link to={href!} {...restProps} />;
  }, []);

  if (items[0].items.every((item) => !item.isSelected)) {
    return null;
  }

  return (
    <EuiPageSideBar>
      <EuiSideNav items={items} renderItem={renderItem} />
    </EuiPageSideBar>
  );
}
