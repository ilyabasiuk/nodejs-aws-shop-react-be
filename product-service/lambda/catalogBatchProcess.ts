import {
  DynamoDBClient,
  TransactWriteItemsCommand,
} from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult,
} from "aws-lambda";

import { v4 } from "uuid";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  console.log("Request:", event);

  //   let body;

  //   try {
  //     body = JSON.parse(event.body || "{}");
  //     if (!body.title || !body.description || !body.price || !body.count) {
  //       throw new Error("Product data is required");
  //     }
  //   } catch (error) {
  //     return {
  //       statusCode: 400,
  //       headers: {
  //         "Access-Control-Allow-Origin": "*",
  //         "Access-Control-Allow-Headers": "Content-Type",
  //         "Access-Control-Allow-Methods": "POST",
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({ message: "Product data is required" }),
  //     };
  //   }

  //   try {
  //     // create product in dynamodb
  //     const id = v4();
  //     const { title, description, price, count } = body;

  //     const transactCommand = new TransactWriteItemsCommand({
  //       TransactItems: [
  //         {
  //           Put: {
  //             TableName: process.env.PRODUCT_TABLE_NAME,
  //             Item: marshall({
  //               id,
  //               title,
  //               description,
  //               price,
  //             }),
  //           },
  //         },
  //         {
  //           Put: {
  //             TableName: process.env.STOCK_TABLE_NAME,
  //             Item: marshall({
  //               product_id: id,
  //               count,
  //             }),
  //           },
  //         },
  //       ],
  //     });

  //     const response = await docClient.send(transactCommand);

  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "POST",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message: "Product created" }),
  };
  //   } catch (error) {
  //     console.error("Error:", error);
  //     return {
  //       statusCode: 500,
  //       headers: {
  //         "Access-Control-Allow-Origin": "*",
  //         "Access-Control-Allow-Headers": "Content-Type",
  //         "Access-Control-Allow-Methods": "POST",
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({ message: "Product not created" }),
  //     };
  //   }
};
