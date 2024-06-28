// import { createApiRoutes as initializeRagAiBackend } from '@roadiehq/rag-ai-backend';
import { createApiRoutes as initializeRagAiBackend } from './rag-ai-backend/src/service';
import { PluginEnvironment } from '../types';
import { createRoadiePgVectorStore } from '@roadiehq/rag-ai-storage-pgvector';
import { CatalogClient } from '@backstage/catalog-client';
import { createDefaultRetrievalPipeline } from '@roadiehq/rag-ai-backend-retrieval-augmenter';
import { initializeBedrockEmbeddings } from '@roadiehq/rag-ai-backend-embeddings-aws';
import { DefaultAwsCredentialsManager } from '@backstage/integration-aws-node';
import { Bedrock } from '@langchain/community/llms/bedrock';
import express from 'express';

export default async function createPlugin({
  logger,
  tokenManager,
  database,
  discovery,
  config,
}: PluginEnvironment) {
  const catalogApi = new CatalogClient({
    discoveryApi: discovery,
  });

  const vectorStore = await createRoadiePgVectorStore({
    logger,
    database,
    config,
  });

  const awsCredentialsManager = DefaultAwsCredentialsManager.fromConfig(config);
  const credProvider = await awsCredentialsManager.getCredentialProvider();
  const augmentationIndexer = await initializeBedrockEmbeddings({
    logger,
    tokenManager,
    catalogApi,
    vectorStore,
    discovery,
    config,
    options: {
      region: 'us-east-1',
      credentials: credProvider.sdkCredentialProvider,
    },
  });

  const model = new Bedrock({
    maxTokens: 512,
    // model: 'anthropic.claude-instant-v1', // 'amazon.titan-text-express-v1', 'anthropic.claude-v2', 'mistral-xx'*
    model: 'anthropic.claude-v2:1',
    region: 'us-east-1',
    credentials: credProvider.sdkCredentialProvider,
    temperature: 0.5,
    streaming: true,
    modelKwargs:{
        prompt: "\n\nHuman:<prompt>\n\nAssistant:",
        max_tokens_to_sample: 512,
        top_p: 1,
        top_k: 250,
    }
  });

  const ragAi = await initializeRagAiBackend({
    logger,
    tokenManager,
    augmentationIndexer,
    retrievalPipeline: createDefaultRetrievalPipeline({
      discovery,
      logger,
      vectorStore: augmentationIndexer.vectorStore,
      tokenManager,
    }),
    model,
    config,
  });

  const router = express.Router();

  router.use(express.json());

  router.use((req, res, next) => {
    console.log('Received request on /rag-ai');
    console.log('Method', req.method);
    console.log('Headers', JSON.stringify(req.header, null, 2));
    console.log('Query', JSON.stringify(req.query, null, 2));
    console.log('Body', JSON.stringify(req.body, null, 2));
    res.send('Response');
    next();
  });
  
  // router.use('/embeddings/:source', ragAi.router);
  router.use('/', ragAi.router);
  return router;
  // return ragAi.router;
}