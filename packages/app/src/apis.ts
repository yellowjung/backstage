import {
  ScmIntegrationsApi,
  scmIntegrationsApiRef,
  ScmAuth,
} from '@backstage/integration-react';
import {
  AnyApiFactory,
  configApiRef,
  createApiFactory,
  ApiRef,
  createApiRef,
  OpenIdConnectApi,
  ProfileInfoApi,
  BackstageIdentityApi,
  SessionApi,
  discoveryApiRef,
  oauthRequestApiRef,
  fetchApiRef,
  identityApiRef,
} from '@backstage/core-plugin-api';

import { OAuth2 } from '@backstage/core-app-api';

import fetch from 'cross-fetch';
import { ragAiApiRef, RoadieRagAiClient } from '@roadiehq/rag-ai';

export const oidcAuthApiRef: ApiRef<
  OpenIdConnectApi & // The OICD API that will handle authentication
    ProfileInfoApi & // Profile API for requesting user profile info from the auth provider in question
    BackstageIdentityApi & // Backstage identity API to handle and associate the user profile with backstage identity.
    SessionApi // Session API, to handle the session the user will have while logged in.
> = createApiRef({
  id: 'auth.example', // Can be anything as long as it doesn't conflict with other Api ref IDs
});

// export const apis: AnyApiFactory[] = [
//   createApiFactory({
//     api: scmIntegrationsApiRef,
//     deps: { configApi: configApiRef },
//     factory: ({ configApi }) => ScmIntegrationsApi.fromConfig(configApi),
//   }),
//   ScmAuth.createDefaultApiFactory(),
// ];

export const apis: AnyApiFactory[] = [
  createApiFactory({
    api: oidcAuthApiRef,
    deps: {
      discoveryApi: discoveryApiRef,
      oauthRequestApi: oauthRequestApiRef,
      configApi: configApiRef,
    },
    factory: ({ discoveryApi, oauthRequestApi, configApi }) =>
      OAuth2.create({
        configApi,
        discoveryApi,
        oauthRequestApi,
        provider: {
          id: 'example',
          title: 'Example Auth Provider',
          icon: () => null,
        },
        environment: configApi.getOptionalString('auth.environment'),
        defaultScopes: ['openid', 'profile', 'email'],
        popupOptions: {
          size: {
            // fullscreen: true,
            // or specify popup width and height
            width: 1000,
            height: 1000,
          },
        },
      }),
  }),
  createApiFactory({
    api: scmIntegrationsApiRef,
    deps: { configApi: configApiRef },
    factory: ({ configApi }) => ScmIntegrationsApi.fromConfig(configApi),
  }),
  createApiFactory({
    api: ragAiApiRef,
    deps: {
      configApi: configApiRef,
      discoveryApi: discoveryApiRef,
      fetchApi: fetchApiRef,
      identityApi: identityApiRef,
    },
    factory: ({ discoveryApi, fetchApi, configApi, identityApi }) => {
      return new RoadieRagAiClient({
        discoveryApi,
        fetchApi,
        configApi,
        identityApi,
      });
    },
  }),
  ScmAuth.createDefaultApiFactory(),
];
