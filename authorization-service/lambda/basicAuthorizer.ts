import { Handler } from "aws-cdk-lib/aws-lambda";
import { StatementEffect } from "aws-lambda/trigger/api-gateway-authorizer";

export const handler: Handler = async (event: any) => {
  console.log("event: ", event);
  const token = event.authorizationToken;
  const login = process.env.LOGIN;
  const password = process.env.PASSWORD;

  const allowEffect: StatementEffect = "Allow";
  const denyEffect: StatementEffect = "Deny";

  return {
    principalId: process.env.LOGIN || "",
    policyDocument: {
      Version: "2012-10-17",
      Statement: [
        {
          Action: ["execute-api:Invoke"],
          Effect: allowEffect,
          Resource: event.methodArn,
        },
      ],
    },
  };
};
