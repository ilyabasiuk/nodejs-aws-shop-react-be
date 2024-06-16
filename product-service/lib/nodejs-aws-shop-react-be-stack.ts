import { CfnOutput, Stack, StackProps } from "aws-cdk-lib";
import {
  Cors,
  LambdaIntegration,
  LambdaRestApi,
  RestApi,
} from "aws-cdk-lib/aws-apigateway";
import { Code, Function, Runtime } from "aws-cdk-lib/aws-lambda";
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

    const getProductsList = new Function(this, "GetProductsListHandler", {
      runtime: Runtime.NODEJS_18_X,
      code: Code.fromAsset("lambda"),
      handler: "getProductsList.handler",
    });

    // define api gateway resource
    const gateway = new RestApi(this, "Product Service", {
      restApiName: "Product Service",
      description: "This service serves products.",
    });

    // define Get endpoint for getProductsList lambda
    const productResource = gateway.root.addResource("products", {
      defaultCorsPreflightOptions: {
        allowOrigins: Cors.ALL_ORIGINS,
        allowMethods: Cors.ALL_METHODS,
      },
    });
    productResource.addMethod("GET", new LambdaIntegration(getProductsList));

    new CfnOutput(this, "GatewayUrl", { value: productResource.path });
  }
}
