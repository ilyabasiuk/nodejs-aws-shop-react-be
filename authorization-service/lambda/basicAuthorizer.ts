import { Handler } from "aws-cdk-lib/aws-lambda";

export const handler: Handler = async (event: any) => {
  console.log("event: ", event);
};
