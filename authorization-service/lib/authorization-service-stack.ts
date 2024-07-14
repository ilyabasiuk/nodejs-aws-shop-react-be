import * as dotenv from "dotenv";
import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { Code, Function, Runtime } from "aws-cdk-lib/aws-lambda";
// import * as sqs from 'aws-cdk-lib/aws-sqs';

dotenv.config();

export class AuthorizationServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const login = "ilyabasiuk";
    const password = process.env[login];
    console.log(process.env.ilyabasiuk);

    const basicAuthorizer = new Function(this, "BasicAuthorizer", {
      runtime: Runtime.NODEJS_16_X,
      handler: "basicAuthorizer.handler",
      code: Code.fromAsset("lambda"),
      environment: {
        USERNAME: login,
        PASSWORD: password!,
      },
      functionName: "basicAuthorizer",
    });

    new cdk.CfnOutput(this, "basicAuthorizer", {
      value: basicAuthorizer.functionName,
    });
  }
}
