import { Entity } from '@backstage/catalog-model'
import {
  createPlugin,
  createRoutableExtension,
} from '@backstage/core-plugin-api';

import { ECR_ANNOTATION_REPOSITORY } from './components/useECRAppData'
import { rootRouteRef } from './routes';

export const ecrPlugin = createPlugin({
  id: 'ecr',
  routes: {
    root: rootRouteRef,
  },
});



export const EcrPage = ecrPlugin.provide(
  createRoutableExtension({
    name: 'EcrPage',
    component: () =>
      import('./components/ExampleComponent').then(m => m.ExampleComponent),
    mountPoint: rootRouteRef,
  }),
);


// export const isECRAvailable = (entity: Entity) => {
//   Boolean(entity.metadata.annotations?.[ECR_ANNOTATION_REPOSITORY]);
// }