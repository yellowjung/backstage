export type EcrImage = {

}

export type EcrConfig = {
    region: string;
    repositoryName: string;
}

export interface EcrAPI {
    getEcrRepositoryImageList: (config: EcrConfig) => Promise<any>;
}