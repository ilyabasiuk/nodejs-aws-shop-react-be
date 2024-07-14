import { Handler } from "aws-cdk-lib/aws-lambda";
import { StatementEffect } from "aws-lambda/trigger/api-gateway-authorizer";

export const handler: Handler = async (event: any) => {
  console.log("event: ", event);
  const authToken = event.authorizationToken;
  const login = process.env.USERNAME;
  const password = process.env.PASSWORD;
  console.log("login: ", login);

  const allowEffect: StatementEffect = "Allow";
  const denyEffect: StatementEffect = "Deny";

  const token = event.authorizationToken.split(" ")[1];
  const encodedToken = Buffer.from(token, "base64").toString("utf-8");
  const [username, psw] = encodedToken.split(":");
  console.log("username: ", username);
  console.log("password: ", psw);

  if (username !== login || psw !== password) {
    return {
      principalId: login,
      policyDocument: {
        Version: "2012-10-17",
        Statement: [
          {
            Action: ["execute-api:Invoke"],
            Effect: denyEffect,
            Resource: event.methodArn,
          },
        ],
      },
    };
  }

  return {
    principalId: login,
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
