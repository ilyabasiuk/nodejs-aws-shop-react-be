import { APIGatewayEvent, Context } from "aws-lambda";
import { handler } from "./getProductsList";
import { PRODUCTS } from "./products";

describe("getProductsList", () => {
  it("should return a list of products", async () => {
    const response = await handler(
      {} as APIGatewayEvent,
      {} as Context,
      () => {}
    );
    expect(response).toEqual({
      statusCode: 200,
      body: JSON.stringify(PRODUCTS),
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "GET",
        "Content-Type": "application/json",
      },
    });
  });
});
