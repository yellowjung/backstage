import {
    createRouter,
    DefaultAwsCodeBuildService,
  } from '@aws/aws-codebuild-plugin-for-backstage-backend';
  import { CatalogClient } from '@backstage/catalog-client';
  import { PluginEnvironment } from '../types';
  
  export default async function createPlugin(env: PluginEnvironment) {
    const catalogApi = new CatalogClient({ discoveryApi: env.discovery });
    const awsCodeBuildApi = await DefaultAwsCodeBuildService.fromConfig(
      env.config,
      {
        catalogApi,
        discovery: env.discovery,
        logger: env.logger,
      },
    );
    return createRouter({
      logger: env.logger,
      discovery: env.discovery,
      awsCodeBuildApi,
    });
  } 