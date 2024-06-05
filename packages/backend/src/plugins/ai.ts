import { createApiRoutes as initializeRagAiBackend } from '@roadiehq/rag-ai-backend';
import { PluginEnvironment } from '../types';
import { initializeBedrockEmbeddings } from '@roadiehq/rag-ai-backend-embeddings-aws';
import { createRoadiePgVectorStore } from '@roadiehq/rag-ai-storage-pgvector';
import { createDefaultRetrievalPipeline } from '@roadiehq/rag-ai-backend-retrieval-augmenter';
import { Bedrock } from '@langchain/community/llms/bedrock/web';
import { CatalogClient } from '@backstage/catalog-client';
import { DefaultAwsCredentialsManager } from '@backstage/integration-aws-node';

export default async function createPlugin({
  logger,
  database,
  discovery,
  config,
  tokenManager
}: PluginEnvironment) {
  const catalogApi = new CatalogClient({
    discoveryApi: discovery,
  });

  const vectorStore = await createRoadiePgVectorStore({ logger, database, config });
  const awsCredentialsManager = DefaultAwsCredentialsManager.fromConfig(config);
  const credProvider = await awsCredentialsManager.getCredentialProvider();

  const augmentationIndexer = await initializeBedrockEmbeddings({
    logger,
    catalogApi,
    vectorStore,
    discovery,
    config,
    tokenManager,
    options: {
      credentials: credProvider.sdkCredentialProvider,
      region: 'eu-central-1',
    },
  });

  const model = new Bedrock({
    maxTokens: 4096,
    model: 'anthropic.claude-instant-v1', // 'amazon.titan-text-express-v1', 'anthropic.claude-v2', 'mistral-xx'
    region: 'eu-central-1',
    credentials: credProvider.sdkCredentialProvider,
  });

  const ragAi = await initializeRagAiBackend({
      logger,
      augmentationIndexer,
      retrievalPipeline: createDefaultRetrievalPipeline({
          discovery,
          logger,
          vectorStore: augmentationIndexer.vectorStore,
          tokenManager
      }),
      model,
      config,
      tokenManager
  });

  return ragAi.router;
}