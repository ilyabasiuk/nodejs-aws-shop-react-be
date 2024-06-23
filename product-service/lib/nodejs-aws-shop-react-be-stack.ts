import { CfnOutput, RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import { Cors, LambdaIntegration, RestApi } from "aws-cdk-lib/aws-apigateway";
import { AttributeType, Table } from "aws-cdk-lib/aws-dynamodb";
import { PolicyStatement } from "aws-cdk-lib/aws-iam";
import { Code, Function, Runtime } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import { get } from "http";

export class NodejsAwsShopReactBeStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // define dynamodb tables
    const productsTable = new Table(this, "Products", {
      partitionKey: { name: "id", type: AttributeType.STRING },
      tableName: "products",
      sortKey: { name: "title", type: AttributeType.STRING },
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const stocksTable = new Table(this, "Stocks", {
      partitionKey: { name: "product_id", type: AttributeType.STRING },
      tableName: "stocks",
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const dynamoPolicy = new PolicyStatement({
      actions: [
        "dynamodb:Scan",
        "dynamodb:Query",
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:UpdateItem",
      ],
      resources: [productsTable.tableArn, stocksTable.tableArn],
    });

    // define lambda functions
    const getProductsList = new Function(this, "GetProductsListHandler", {
      runtime: Runtime.NODEJS_18_X,
      code: Code.fromAsset("lambda"),
      handler: "getProductsList.handler",
      environment: {
        PRODUCT_TABLE_NAME: productsTable.tableName,
        STOCK_TABLE_NAME: stocksTable.tableName,
      },
    });
    getProductsList.addToRolePolicy(dynamoPolicy);

    const getProductsById = new Function(this, "GetProductsByIdHandler", {
      runtime: Runtime.NODEJS_18_X,
      code: Code.fromAsset("lambda"),
      handler: "getProductsById.handler",
      environment: {
        PRODUCT_TABLE_NAME: productsTable.tableName,
        STOCK_TABLE_NAME: stocksTable.tableName,
      },
    });
    getProductsById.addToRolePolicy(dynamoPolicy);

    const fillDb = new Function(this, "FillDbHandler", {
      runtime: Runtime.NODEJS_18_X,
      code: Code.fromAsset("lambda"),
      handler: "fillDb.handler",
      environment: {
        PRODUCT_TABLE_NAME: productsTable.tableName,
        STOCK_TABLE_NAME: stocksTable.tableName,
      },
    });
    fillDb.addToRolePolicy(dynamoPolicy);

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
