import {
  createComponentExtension,
  createPlugin,
  createRoutableExtension,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

export const randomJokePlugin = createPlugin({
  id: 'random-joke',
  routes: {
    root: rootRouteRef,
  },
});

export const RandomJokeCard = randomJokePlugin.provide(
  createComponentExtension({
    component: {
      lazy: () =>
        import('./components/RandomJokeCard').then(m => m.RandomJokeCard),
    },
  }),
);

export const RandomJokePage = randomJokePlugin.provide(
  createRoutableExtension({
    name: 'RandomJokePage',
    component: () =>
      import('./components/ExampleComponent').then(m => m.ExampleComponent),
    mountPoint: rootRouteRef,
  }),
);
