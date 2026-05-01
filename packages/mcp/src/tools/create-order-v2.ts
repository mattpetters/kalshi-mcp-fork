/**
 * Create Order V2 Tool
 *
 * MCP tool for placing orders using the Kalshi V2 event-market order endpoint
 * (POST /portfolio/events/orders) with RSA-PSS signed requests.
 *
 * The V1 endpoint (/portfolio/orders) rejects many sports/event markets with
 * "active, not open for trading" despite markets being fully tradeable.
 * V2 works for ALL market types.
 *
 * @module tools/create-order-v2
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createSign, createHash } from "node:crypto";
import { z } from "zod";

/** RSA-PSS salt length for SHA256 */
const SHA256_DIGEST_LENGTH = 32;

/** Schema for create_order_v2 tool parameters */
const CreateOrderV2Schema = z.object({
  ticker: z.string().describe("Market ticker to place order on"),
  side: z.enum(["bid", "ask"]).describe("Side: 'bid' (buy YES) or 'ask' (sell YES)"),
  count: z.string().describe("Number of contracts as fixed-point string (e.g., '10.00')"),
  price: z.string().describe("Price in fixed-point dollars (e.g., '0.6200' for 62¢)"),
  time_in_force: z
    .enum(["fill_or_kill", "good_till_canceled", "immediate_or_cancel"])
    .default("immediate_or_cancel")
    .describe("Time in force"),
  client_order_id: z.string().optional().describe("Optional order ID for idempotency"),
  post_only: z.boolean().optional().describe("Whether the order should be post-only"),
  reduce_only: z.boolean().optional().describe("Whether the order should reduce position only"),
});

type CreateOrderV2Input = z.infer<typeof CreateOrderV2Schema>;

/**
 * Create an RSA-PSS signature for Kalshi V2 API requests
 */
function signRequest(privateKeyPem: string, timestamp: number, method: string, path: string): string {
  const pathClean = path.split("?")[0];
  const message = `${timestamp}${method}${pathClean}`;
  const signer = createSign("RSA-SHA256");
  signer.update(message, "utf-8");
  const signature = signer.sign({
    key: privateKeyPem,
    padding: 1, // RSA_PKCS1_PSS_PADDING
    saltLength: SHA256_DIGEST_LENGTH,
  });
  return signature.toString("base64");
}

/**
 * Registers the create_order_v2 tool with the MCP server.
 */
export function registerCreateOrderV2(
  server: McpServer,
  apiKey: string,
  privateKey: string,
  basePath: string,
) {
  server.tool(
    "create_order_v2",
    "Place a new order using the V2 event-market endpoint. Works on ALL market types. CAUTION: This will execute a real trade with real money.",
    {
      ticker: z.string().describe("Market ticker to place order on"),
      side: z.enum(["bid", "ask"]).describe("Side: 'bid' (buy YES) or 'ask' (sell YES)"),
      count: z.string().describe("Number of contracts as fixed-point string (e.g., '10.00')"),
      price: z.string().describe("Price in fixed-point dollars (e.g., '0.6200' for 62¢)"),
      time_in_force: z
        .enum(["fill_or_kill", "good_till_canceled", "immediate_or_cancel"])
        .default("immediate_or_cancel")
        .describe("Time in force"),
      client_order_id: z.string().optional().describe("Optional order ID for idempotency"),
      post_only: z.boolean().optional().describe("Whether the order should be post-only"),
      reduce_only: z.boolean().optional().describe("Whether the order should reduce position only"),
    },
    async (params: CreateOrderV2Input) => {
      try {
        const timestamp = Date.now();
        const path = "/trade-api/v2/portfolio/events/orders";

        const body: Record<string, unknown> = {
          ticker: params.ticker,
          client_order_id: params.client_order_id || `mcp_v2_${timestamp}`,
          side: params.side,
          count: params.count,
          price: params.price,
          time_in_force: params.time_in_force,
          self_trade_prevention_type: "taker_at_cross",
        };

        if (params.post_only !== undefined) body.post_only = params.post_only;
        if (params.reduce_only !== undefined) body.reduce_only = params.reduce_only;

        const bodyJson = JSON.stringify(body);
        const signature = signRequest(privateKey, timestamp, "POST", path);

        const response = await fetch(`${basePath}/portfolio/events/orders`, {
          method: "POST",
          headers: {
            "KALSHI-ACCESS-KEY": apiKey,
            "KALSHI-ACCESS-SIGNATURE": signature,
            "KALSHI-ACCESS-TIMESTAMP": String(timestamp),
            "Content-Type": "application/json",
          },
          body: bodyJson,
        });

        const result = (await response.json()) as Record<string, unknown>;

        if (!response.ok) {
          return {
            content: [
              {
                type: "text" as const,
                text: JSON.stringify(
                  {
                    success: false,
                    error: result,
                    httpStatus: response.status,
                  },
                  null,
                  2,
                ),
              },
            ],
            isError: true,
          };
        }

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  success: true,
                  message: "Order created successfully (V2)",
                  order: result,
                },
                null,
                2,
              ),
            },
          ],
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error occurred";
        return {
          content: [
            {
              type: "text" as const,
              text: `Error creating order (V2): ${message}`,
            },
          ],
          isError: true,
        };
      }
    },
  );
}
