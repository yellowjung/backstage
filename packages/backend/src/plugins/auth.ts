import {
  createRouter,
  providers,
  defaultAuthProviderFactories,
} from '@backstage/plugin-auth-backend';
import { Router } from 'express';
import { PluginEnvironment } from '../types';

import {
  DEFAULT_NAMESPACE,
  stringifyEntityRef,
} from '@backstage/catalog-model';

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  return await createRouter({
    logger: env.logger,
    config: env.config,
    database: env.database,
    discovery: env.discovery,
    tokenManager: env.tokenManager,
    providerFactories: {
      ...defaultAuthProviderFactories,

      // This replaces the default GitHub auth provider with a customized one.
      // The `signIn` option enables sign-in for this provider, using the
      // identity resolution logic that's provided in the `resolver` callback.
      //
      // This particular resolver makes all users share a single "guest" identity.
      // It should only be used for testing and trying out Backstage.
      //
      // If you want to use a production ready resolver you can switch to
      // the one that is commented out below, it looks up a user entity in the
      // catalog using the GitHub username of the authenticated user.
      // That resolver requires you to have user entities populated in the catalog,
      // for example using https://backstage.io/docs/integrations/github/org
      //
      // There are other resolvers to choose from, and you can also create
      // your own, see the auth documentation for more details:
      //
      //   https://backstage.io/docs/auth/identity-resolver
      oauth2Proxy: providers.oauth2Proxy.create({
        signIn: {
          async resolver({ result }, ctx) {
            const name = result.getHeader('x-forwarded-preferred-username');
            if (!name) {
              throw new Error('Request did not contain a user');
            }

            try {
              // Attempts to sign in existing user
              const signedInUser = await ctx.signInWithCatalogUser({
                entityRef: { name },
              });

              return Promise.resolve(signedInUser);
            } catch (e) {
              // Create stub user
              const userEntityRef = stringifyEntityRef({
                kind: 'User',
                name: name,
                namespace: DEFAULT_NAMESPACE,
              });
              return ctx.issueToken({
                claims: {
                  sub: userEntityRef,
                  ent: [userEntityRef],
                },
              });
            }
          },
        },
      }),
      github: providers.github.create({
        signIn: {
          resolver(_, ctx) {
            const userRef = 'user:default/guest'; // Must be a full entity reference
            return ctx.issueToken({
              claims: {
                sub: userRef, // The user's own identity
                ent: [userRef], // A list of identities that the user claims ownership through
              },
            });
          },
          // resolver: providers.github.resolvers.usernameMatchingUserEntityName(),
        },
      }),
      // example: providers.oidc.create({
      //   signIn: {
      //     resolver(info, ctx) {
      //       const userRef = stringifyEntityRef({
      //         kind: 'User',
      //         name: info.result.userinfo.sub,
      //         namespace: DEFAULT_NAMESPACE,
      //       });
      //       return ctx.issueToken({
      //         claims: {
      //           sub: userRef,
      //           ent: [userRef],
      //         },
      //       });
      //     },
      //   },
      // }),
    },
  });
}

// export default async function createPlugin(
//   env: PluginEnvironment,
// ): Promise<Router> {
//   return await createRouter({
//     logger: env.logger,
//     config: env.config,
//     database: env.database,
//     discovery: env.discovery,
//     tokenManager: env.tokenManager,
//     providerFactories: {
//       ...defaultAuthProviderFactories,
//       github: providers.github.create({
//         signIn: {
//           resolver(_, ctx) {
//             const userRef = 'user:default/guest'; // Must be a full entity reference
//             return ctx.issueToken({
//               claims: {
//                 sub: userRef, // The user's own identity
//                 ent: [userRef], // A list of identities that the user claims ownership through
//               },
//             });
//           },
//           // resolver: providers.github.resolvers.usernameMatchingUserEntityName(),
//         },
//       }),
//       // NOTE: Here you add the provider and resolver to unpack data from token
//       example: providers.oidc.create({
//         signIn: {
//           resolver(info, ctx) {
//             const userRef = stringifyEntityRef({
//               kind: 'User',
//               name: info.result.userinfo.sub, // NOTE: this is from the token
//               namespace: DEFAULT_NAMESPACE,
//             });
//             return ctx.issueToken({
//               claims: {
//                 sub: userRef, // The user's own identity
//                 ent: [userRef], // A list of identities that the user claims ownership through
//               },
//             });
//           },
//         },
//       }),
//     },
//   });
// }
