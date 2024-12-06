import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { randomJokePlugin, RandomJokePage } from '../src/plugin';

createDevApp()
  .registerPlugin(randomJokePlugin)
  .addPage({
    element: <RandomJokePage />,
    title: 'Root Page',
    path: '/random-joke',
  })
  .render();
