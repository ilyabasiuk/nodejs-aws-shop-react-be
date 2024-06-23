import {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult,
} from "aws-lambda";
import {
  DynamoDBClient,
  QueryCommand,
  ScalarAttributeType,
} from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  console.log("Request:", event);

  const productId = event.pathParameters?.productId;
  if (!productId) {
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "GET",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: "Product ID is required" }),
    };
  }
  // get product by id from dynamodb

  const command = new QueryCommand({
    TableName: process.env.PRODUCT_TABLE_NAME,
    KeyConditionExpression: "id = :id",
    ExpressionAttributeValues: {
      ":id": { [ScalarAttributeType.S]: productId },
    },
  });
  const response = await docClient.send(command);
  const product = response.Items ? unmarshall(response.Items[0]) : null;

  if (!product) {
    return {
      statusCode: 404,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "GET",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: "Product not found" }),
    };
  }

  const commandStock = new QueryCommand({
    TableName: process.env.STOCK_TABLE_NAME,
    KeyConditionExpression: "product_id = :id",
    ExpressionAttributeValues: {
      ":id": { [ScalarAttributeType.S]: productId },
    },
  });

  const responseStock = await docClient.send(commandStock);
  const stock = responseStock.Items ? unmarshall(responseStock.Items[0]) : null;

  product.count = stock ? stock.count : 0;

  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "GET",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(product),
  };
};
