import { EcrAPI, EcrConfig } from './types';
import { DescribeImagesCommand, ECRClient } from "@aws-sdk/client-ecr";

export class EcrService implements EcrAPI {
    // private readonly ecr: AWS.ECR;

    // constructor() {
    //     this.ecr = new AWS.ECR();
    // }
    // default region is ap-northeast-2
    // default repository name is "test"

    async getEcrRepositoryImageList(config: EcrConfig): Promise<any> {
        const client = new ECRClient({ region: "ap-northeast-2" });
        const command = new DescribeImagesCommand({ repositoryName: "demo" });
        const response = await client.send(command);

        if (response.imageDetails) {
            return response.imageDetails;
        }
        throw new Error("No image details found");
    }
}
