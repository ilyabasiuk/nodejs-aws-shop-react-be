import {
  DynamoDBClient,
  TransactWriteItemsCommand,
} from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import { SQSEvent, SQSHandler } from "aws-lambda";

import { v4 } from "uuid";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const handler: SQSHandler = async (event: SQSEvent): Promise<void> => {
  console.log("Request:", event);

  for (const record of event.Records) {
    console.log("Record: ", record);
    const product = JSON.parse(record.body);
    console.log("Product: ", product);
    const { title, description, price, count } = product;
    try {
      if (!title || !description || !price || !count) {
        throw new Error("Product data is required");
      }
      await saveProduct(product);
      console.log("Product has been saved", product.title);
    } catch (error) {
      console.error("Error:", error);
    }
  }
};

async function saveProduct(product: any) {
  const id = v4();
  const { title, description, price, count } = product;

  const transactCommand = new TransactWriteItemsCommand({
    TransactItems: [
      {
        Put: {
          TableName: process.env.PRODUCT_TABLE_NAME,
          Item: marshall({
            id,
            title,
            description,
            price,
          }),
        },
      },
      {
        Put: {
          TableName: process.env.STOCK_TABLE_NAME,
          Item: marshall({
            product_id: id,
            count,
          }),
        },
      },
    ],
  });

  const response = await docClient.send(transactCommand);
}
