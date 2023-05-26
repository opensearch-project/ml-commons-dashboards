/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from 'react';
import { useLocation, matchPath, generatePath } from 'react-router-dom';

import { ChromeBreadcrumb, CoreStart } from '../../../../src/core/public';
import { ROUTES } from '../../common/router';
import { PLUGIN_NAME, routerPaths } from '../../common';
import { APIProvider } from '../apis/api_provider';

type RouteConfig = typeof ROUTES[number];

const joinUrl = (basename: string, pathname: string) =>
  `${basename.endsWith('/') ? basename.slice(0, -1) : basename}${pathname}`;

const getBasicBreadcrumbs = (basename: string): ChromeBreadcrumb[] => {
  return [{ text: PLUGIN_NAME, href: basename }];
};

const getRouteMatchedBreadcrumbs = (basename: string, matchedRoute: RouteConfig | undefined) => {
  const breadcrumbs: ChromeBreadcrumb[] = getBasicBreadcrumbs(basename);
  if (!matchedRoute?.label) {
    return breadcrumbs;
  }
  return breadcrumbs.concat({
    text: matchedRoute.label,
  });
};

const getBasicModelRegistryBreadcrumbs = (basename: string) => {
  const breadcrumbs = getRouteMatchedBreadcrumbs(
    basename,
    ROUTES.find((item) => item.path === routerPaths.modelList)
  );
  breadcrumbs[breadcrumbs.length - 1].href = joinUrl(basename, routerPaths.modelList);
  return breadcrumbs;
};

const getModelRegisterBreadcrumbs = (basename: string, matchedParams: {}) => {
  const baseModelRegistryBreadcrumbs = getBasicModelRegistryBreadcrumbs(basename);
  if ('id' in matchedParams && typeof matchedParams.id === 'string') {
    const modelId = matchedParams.id;
    return {
      staticBreadcrumbs: baseModelRegistryBreadcrumbs,
      // TODO: Change to model group API
      asyncBreadcrumbsLoader: () =>
        APIProvider.getAPI('modelGroup')
          .getOne(modelId)
          .then(
            (model) =>
              [
                {
                  text: model.name,
                  href: joinUrl(basename, generatePath(routerPaths.model, { id: modelId })),
                },
                {
                  text: 'Register version',
                },
              ] as ChromeBreadcrumb[]
          ),
    };
  }
  return {
    staticBreadcrumbs: [
      ...baseModelRegistryBreadcrumbs,
      {
        text: 'Register model',
      },
    ],
  };
};

const getModelBreadcrumbs = (basename: string, matchedParams: {}) => {
  const baseModelRegistryBreadcrumbs = getBasicModelRegistryBreadcrumbs(basename);
  if ('id' in matchedParams && typeof matchedParams.id === 'string') {
    const modelId = matchedParams.id;
    return {
      staticBreadcrumbs: baseModelRegistryBreadcrumbs,
      asyncBreadcrumbsLoader: () => {
        return APIProvider.getAPI('modelGroup')
          .getOne(modelId)
          .then(
            (model) =>
              [
                {
                  text: model.name,
                },
              ] as ChromeBreadcrumb[]
          );
      },
    };
  }
  return {
    staticBreadcrumbs: baseModelRegistryBreadcrumbs,
  };
};

const getModelVersionBreadcrumbs = (basename: string, matchedParams: {}) => {
  const baseModelRegistryBreadcrumbs = getBasicModelRegistryBreadcrumbs(basename);
  if ('id' in matchedParams && typeof matchedParams.id === 'string') {
    const modelId = matchedParams.id;
    return {
      staticBreadcrumbs: baseModelRegistryBreadcrumbs,
      // TODO: Change to model group API
      asyncBreadcrumbsLoader: () =>
        APIProvider.getAPI('model')
          .getOne(modelId)
          .then(
            (model) =>
              [
                {
                  text: model.name,
                  // TODO: Change to use model group id
                  href: joinUrl(basename, generatePath(routerPaths.model, { id: modelId })),
                },
                {
                  text: `Version ${model.model_version}`,
                },
              ] as ChromeBreadcrumb[]
          ),
    };
  }
  return {
    staticBreadcrumbs: baseModelRegistryBreadcrumbs,
  };
};

const routerPathBreadcrumbsMap = {
  [routerPaths.registerModel]: getModelRegisterBreadcrumbs,
  [routerPaths.model]: getModelBreadcrumbs,
  [routerPaths.modelVersion]: getModelVersionBreadcrumbs,
};

export const GlobalBreadcrumbs = ({
  onBreadcrumbsChange,
  basename,
}: {
  onBreadcrumbsChange: CoreStart['chrome']['setBreadcrumbs'];
  basename: string;
}) => {
  const location = useLocation();

  useEffect(() => {
    let matchedRoute: typeof ROUTES[number] | undefined;
    let matchedParams = {};
    for (let i = 0; i < ROUTES.length; i++) {
      const route = ROUTES[i];
      const matchedResult = matchPath(location.pathname, { path: route.path, exact: route.exact });
      if (matchedResult) {
        matchedParams = matchedResult.params;
        matchedRoute = route;
        break;
      }
    }

    if (!matchedRoute || !(matchedRoute.path in routerPathBreadcrumbsMap)) {
      onBreadcrumbsChange(getRouteMatchedBreadcrumbs(basename, matchedRoute));
      return;
    }

    let changed = false;
    const { staticBreadcrumbs, asyncBreadcrumbsLoader } = routerPathBreadcrumbsMap[
      matchedRoute.path
    ](basename, matchedParams);

    onBreadcrumbsChange(staticBreadcrumbs);
    if (asyncBreadcrumbsLoader)
      asyncBreadcrumbsLoader().then((asyncBreadcrumbs) => {
        if (!changed) {
          onBreadcrumbsChange([...staticBreadcrumbs, ...asyncBreadcrumbs]);
        }
      });
    return () => {
      changed = true;
    };
  }, [location.pathname, onBreadcrumbsChange, basename]);
  return null;
};
