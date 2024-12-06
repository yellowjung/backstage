import { Entity } from '@backstage/catalog-model'

export const ECR_ANNOTATION_REPOSITORY = 'ecr/repository'

export const useEcrAppData = ({ entity }: { entity: Entity }) => {
  const repositorySlug =
    entity?.metadata.annotations?.[ECR_ANNOTATION_REPOSITORY] ?? ''

  if (!repositorySlug) {
    throw new Error("'ECR' annotations are missing")
  }
  return { repositorySlug }
}
