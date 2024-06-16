import { APIGatewayProxyEvent, Context } from "aws-lambda";
import { handler } from "./getProductsById";
import { PRODUCTS } from "./products";

describe("getProductsById", () => {
  it("should return a product by id", async () => {
    const response = await handler(
      {
        pathParameters: { productId: "456" },
      } as unknown as APIGatewayProxyEvent,
      {} as Context,
      () => {}
    );
    expect(response).toEqual({
      statusCode: 200,
      body: JSON.stringify(PRODUCTS[1]),
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "GET",
        "Content-Type": "application/json",
      },
    });
  });

  it("should return 404 if product not found", async () => {
    const response = await handler(
      {
        pathParameters: { productId: "999" },
      } as unknown as APIGatewayProxyEvent,
      {} as Context,
      () => {}
    );
    expect(response).toEqual({
      statusCode: 404,
      body: JSON.stringify({ message: "Product not found" }),
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "GET",
        "Content-Type": "application/json",
      },
    });
  });
});
