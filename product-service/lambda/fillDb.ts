import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { Handler } from "aws-lambda";
import { PRODUCTS } from "./products";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const handler: Handler = async (): Promise<void> => {
  const products = PRODUCTS;
  for (const product of products) {
    const command = new PutCommand({
      TableName: process.env.PRODUCT_TABLE_NAME,
      Item: {
        ...product,
        title: product.title + " from DB",
      },
    });
    const response = await docClient.send(command);
    console.log(response);
    const commandStock = new PutCommand({
      TableName: process.env.STOCK_TABLE_NAME,
      Item: {
        product_id: product.id,
        count: 10,
      },
    });
    const responseStock = await docClient.send(commandStock);
    console.log(responseStock);
  }
  console.log("Products added to the database");
};
