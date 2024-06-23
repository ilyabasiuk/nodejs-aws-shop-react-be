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
    TableName: process.env.PRODUCT_TABLE_NAME,
  });
  const response: ScanCommandOutput = await docClient.send(command);
  const products = response.Items?.map((item) => unmarshall(item)) || [];

  const commandStock = new ScanCommand({
    TableName: process.env.STOCK_TABLE_NAME,
  });
  const responseStock: ScanCommandOutput = await docClient.send(commandStock);
  const stocks = responseStock.Items?.map((item) => unmarshall(item)) || [];

  const countMap = stocks.reduce((acc, stock) => {
    acc[stock.product_id] = stock.count;
    return acc;
  }, {});

  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "GET",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(
      products.map((product) => ({
        ...product,
        count: countMap[product.id] || 0,
      }))
    ),
  };
};
