import { S3Event, S3Handler, S3EventRecord } from "aws-lambda";
import {
  GetObjectCommand,
  S3Client,
  CopyObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

const client = new S3Client({});

export const handler: S3Handler = async (event: S3Event): Promise<void> => {
  for (const record of event.Records) {
    await handlePutRecord(record);
  }
};

async function handlePutRecord(record: S3EventRecord): Promise<void> {
  console.log("Record: ", record);
  const importPrefix = process.env.IMPORT_PREFIX;
  const processedPrefix = process.env.PROCESSED_PREFIX;
  const bucketName = record.s3.bucket.name;
  const objectKey = record.s3.object.key;
  console.log(
    `New object has been created: ${objectKey} in bucket: ${bucketName}`
  );
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: objectKey,
  });

  try {
    const data = await client.send(command);
    console.log("Data: ", data);

    // move the file to the processed folder
    const copyCommand = new CopyObjectCommand({
      Bucket: bucketName,
      CopySource: `${bucketName}/${objectKey}`,
      Key: objectKey.replace(importPrefix!, processedPrefix!),
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
  }
  // move the file to the processed folder

  // parse the file and save the data to the database
  // delete the file from the uploaded folder

  return Promise.resolve();
}
