import {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult,
} from "aws-lambda";
import {
  DynamoDBClient,
  ScanCommand,
  ScanCommandOutput,
} from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const command = new ScanCommand({
    ProjectionExpression: "id, title, description, price",
    // ExpressionAttributeNames: { "#Name": "Name" },
    TableName: process.env.PRODUCT_TABLE_NAME,
  });
  const response: ScanCommandOutput = await docClient.send(command);
  const products = response.Items?.map((item) => unmarshall(item)) || [];
  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "GET",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(products),
  };
};
