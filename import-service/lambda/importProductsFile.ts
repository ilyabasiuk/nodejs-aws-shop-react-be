import {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult,
} from "aws-lambda";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  console.log("Request:", event);
  const fileName = event.queryStringParameters?.name;
  const bucketName = process.env.BUCKET_NAME;
  const region = process.env.REGION;
  const importPrefix = process.env.IMPORT_PREFIX;

  if (!bucketName || !region) {
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "GET",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: "Environment variables are not provided",
      }),
    };
  }
  if (!fileName) {
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "GET",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: "File name is not provided" }),
    };
  }

  try {
    const presignedUrl = await createPresignedUrlWithClient({
      region: region,
      bucket: bucketName,
      key: importPrefix + fileName,
    });
    console.log("Presigned URL: ", presignedUrl);
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "GET",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url: presignedUrl }),
    };
  } catch (error) {
    console.error("Error: ", error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "GET",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: "Internal server error" }),
    };
  }
};

const createPresignedUrlWithClient = async ({
  region,
  bucket,
  key,
}: {
  region: string;
  bucket: string;
  key: string;
}): Promise<string> => {
  const client = new S3Client({ region });
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: "text/csv",
  });
  return getSignedUrl(client, command, { expiresIn: 3600 });
};
