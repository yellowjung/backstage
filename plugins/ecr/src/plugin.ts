import { Entity } from '@backstage/catalog-model'
import {
  createComponentExtension,
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
  createComponentExtension({
    name: 'EcrPage',
    component: {
      lazy: () =>
        import('./components/ECRRepository/ECRRepository').then(m => m.ECRRepository)
    }
  }),
);


// export const isECRAvailable = (entity: Entity) => {
//   Boolean(entity.metadata.annotations?.[ECR_ANNOTATION_REPOSITORY]);
// }