import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
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

  let body;

  try {
    body = JSON.parse(event.body || "{}");
    if (!body.title || !body.description || !body.price || !body.count) {
      throw new Error("Product data is required");
    }
  } catch (error) {
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: "Product data is required" }),
    };
  }

  try {
    // create product in dynamodb
    const id = v4();
    const { title, description, price, count } = body;
    const command = new PutCommand({
      TableName: process.env.PRODUCT_TABLE_NAME,
      Item: {
        id,
        title,
        description,
        price,
      },
    });

    const response = await docClient.send(command);
    console.log(response);
    // create stock in dynamodb
    const commandStock = new PutCommand({
      TableName: process.env.STOCK_TABLE_NAME,
      Item: {
        product_id: id,
        count,
      },
    });
    const responseStock = await docClient.send(commandStock);
    console.log(responseStock);

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: "Product created", uuid: id }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: "Product not created" }),
    };
  }
};
