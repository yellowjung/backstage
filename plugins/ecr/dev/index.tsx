import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { ecrPlugin, EcrPage } from '../src/plugin';

createDevApp()
  .registerPlugin(ecrPlugin)
  .addPage({
    element: <EcrPage />,
    title: 'Root Page',
    path: '/ecr',
  })
  .render();
