import { Construct } from "constructs";
import { RestApi, Cors, LambdaIntegration } from "aws-cdk-lib/aws-apigateway";
import { Code, Function, Runtime } from "aws-cdk-lib/aws-lambda";
import { CfnOutput, Stack, StackProps } from "aws-cdk-lib";
import { Bucket, EventType } from "aws-cdk-lib/aws-s3";
import { LambdaDestination } from "aws-cdk-lib/aws-s3-notifications";
import {
  AwsCustomResource,
  AwsCustomResourcePolicy,
} from "aws-cdk-lib/custom-resources";

export class ImportServiceStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const nameOfNamuallyCreatedBucket = "ib-import-bucket-manual";
    const bucketRegion = "eu-west-1";
    const importPrefix = "uploaded/";
    // The code that defines your stack goes here
    const importBucket = Bucket.fromBucketName(
      this,
      "importBucket",
      nameOfNamuallyCreatedBucket
    );

    // add cors for PUT method in the bucket
    new AwsCustomResource(this, "ImportBucketCors", {
      onCreate: {
        service: "S3",
        action: "putBucketCors",
        parameters: {
          Bucket: importBucket.bucketName,
          CORSConfiguration: {
            CORSRules: [
              {
                AllowedOrigins: ["*"],
                AllowedMethods: ["PUT", "POST"],
                AllowedHeaders: ["*"],
              },
            ],
          },
        },
        physicalResourceId: {
          id: "ImportBucketCors",
        },
      },
      policy: AwsCustomResourcePolicy.fromSdkCalls({
        resources: AwsCustomResourcePolicy.ANY_RESOURCE,
      }),
    });

    // example resource
    const gateway = new RestApi(this, "Import Service", {
      restApiName: "Import Service",
      description: "This service provide functionality for importing products.",
    });

    const importResource = gateway.root.addResource("import", {
      defaultCorsPreflightOptions: {
        allowOrigins: Cors.ALL_ORIGINS,
        allowMethods: Cors.ALL_METHODS,
      },
    });

    const importFileParser = new Function(this, "ImportFileParserHandler", {
      runtime: Runtime.NODEJS_18_X,
      code: Code.fromAsset("lambda"),
      handler: "importFileParser.handler",
    });

    // call importFileParser lambda on s3:ObjectCreated:* event
    importBucket.addEventNotification(
      EventType.OBJECT_CREATED,
      new LambdaDestination(importFileParser),
      { prefix: importPrefix }
    );

    const importProductsFile = new Function(this, "ImportProductsFileHandler", {
      runtime: Runtime.NODEJS_18_X,
      code: Code.fromAsset("lambda"),
      handler: "importProductsFile.handler",
      environment: {
        BUCKET_NAME: importBucket.bucketName,
        REGION: bucketRegion,
        IMPORT_PREFIX: importPrefix,
      },
    });
    importResource.addMethod("GET", new LambdaIntegration(importProductsFile));

    importBucket.grantReadWrite(importProductsFile);
    importBucket.grantPut(importProductsFile);

    new CfnOutput(this, "GatewayUrl", { value: importResource.path });
  }
}
