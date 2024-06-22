import { CfnOutput, Stack, StackProps } from "aws-cdk-lib";
import { Cors, LambdaIntegration, RestApi } from "aws-cdk-lib/aws-apigateway";
import { Code, Function, Runtime } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";

export class NodejsAwsShopReactBeStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const getProductsList = new Function(this, "GetProductsListHandler", {
      runtime: Runtime.NODEJS_18_X,
      code: Code.fromAsset("lambda"),
      handler: "getProductsList.handler",
    });

    const getProductsById = new Function(this, "GetProductsByIdHandler", {
      runtime: Runtime.NODEJS_18_X,
      code: Code.fromAsset("lambda"),
      handler: "getProductsById.handler",
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

    productResource
      .addResource("{productId}")
      .addMethod("GET", new LambdaIntegration(getProductsById));

    new CfnOutput(this, "GatewayUrl", { value: productResource.path });
  }
}
