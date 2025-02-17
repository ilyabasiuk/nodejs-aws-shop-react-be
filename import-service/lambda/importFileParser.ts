import { S3Event, S3Handler, S3EventRecord } from "aws-lambda";
import { SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs";
import {
  GetObjectCommand,
  S3Client,
  CopyObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { Readable } from "stream";

const client = new S3Client({});
const sqsClient = new SQSClient({});

export const handler: S3Handler = async (event: S3Event): Promise<void> => {
  for (const record of event.Records) {
    await handlePutRecord(record);
  }
};

async function handlePutRecord(record: S3EventRecord): Promise<void> {
  console.log("Record: ", record);
  const importPrefix = process.env.IMPORT_PREFIX;
  const processedPrefix = process.env.PROCESSED_PREFIX;
  const sqsUrl = process.env.SQS_URL;
  const bucketName = record.s3.bucket.name;
  const objectKey = record.s3.object.key;

  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: objectKey,
  });

  try {
    if (!importPrefix || !processedPrefix || !sqsUrl) {
      console.error("Environment variables are not provided");
      throw new Error("Environment variables are not provided");
    }
    const data = await client.send(command);
    if (!data.Body) {
      throw new Error("No File");
    }
    const products = await parseFile(data.Body as Readable);

    // send message to the SQS queue
    let promises = products.map((product: any) => {
      const sqsCommand = new SendMessageCommand({
        QueueUrl: sqsUrl!,
        MessageBody: JSON.stringify(product),
      });
      return sqsClient.send(sqsCommand);
    });

    await Promise.all(promises);
    console.log("Products have been sent to the SQS queue", products);

    // move the file to the processed folder
    const copyCommand = new CopyObjectCommand({
      Bucket: bucketName,
      CopySource: `${bucketName}/${objectKey}`,
      Key: objectKey.replace(importPrefix!, processedPrefix + Date.now() + "-"),
    });
    await client.send(copyCommand);
    console.log("File has been moved to the processed folder");

    // delete the file from the uploaded folder
    const deleteCommand = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: objectKey,
    });
    await client.send(deleteCommand);
    console.log("File has been deleted from the uploaded folder");
  } catch (error) {
    console.error("Error: ", error);
    return Promise.reject(error);
  }
  return Promise.resolve();
}

import * as csvParser from "csv-parser";
async function parseFile(data: Readable): Promise<any> {
  return new Promise((resolve, reject) => {
    const products: any[] = [];
    data
      .pipe(csvParser())
      .on("data", (row) => {
        products.push(row);
      })
      .on("end", () => resolve(products))
      .on("error", (error) => reject(error));
  });
}
