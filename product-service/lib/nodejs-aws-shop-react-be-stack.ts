import { Stack, StackProps } from "aws-cdk-lib";
import { LambdaRestApi } from "aws-cdk-lib/aws-apigateway";
import { Code, Function, Runtime } from "aws-cdk-lib/aws-lambda";
import { Lambda } from "aws-cdk-lib/aws-ses-actions";
import { Construct } from "constructs";

export class NodejsAwsShopReactBeStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // define lambda resource
    const hello = new Function(this, "HelloHandler", {
      runtime: Runtime.NODEJS_18_X,
      code: Code.fromAsset("lambda"),
      handler: "hello.handler",
    });

    // define api gateway resource
    new LambdaRestApi(this, "Endpoint", { handler: hello });
  }
}
