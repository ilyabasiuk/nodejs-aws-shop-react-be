import {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult,
} from "aws-lambda";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import {
  getSignedUrl,
  S3RequestPresigner,
} from "@aws-sdk/s3-request-presigner";

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  console.log("Request:", event);
  const fileName = event.queryStringParameters?.name;
  const bucketName = process.env.BUCKET_NAME;
  const region = process.env.REGION;

  if (!bucketName || !region) {
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
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
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({ message: "File name is not provided" }),
    };
  }

  try {
    const presignedUrl = await createPresignedUrlWithClient({
      region: region,
      bucket: bucketName,
      fileName: fileName,
    });
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: presignedUrl,
    };
  } catch (error) {
    console.error("Error: ", error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({ message: "Internal server error" }),
    };
  }
};

const createPresignedUrlWithClient = async ({
  region,
  bucket,
  fileName,
}: {
  region: string;
  bucket: string;
  fileName: string;
}): Promise<string> => {
  const client = new S3Client({ region });
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: `uploaded/${fileName}`,
  });
  return getSignedUrl(client, command, { expiresIn: 3600 });
};
