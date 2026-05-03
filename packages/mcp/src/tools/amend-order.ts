/**
 * Amend Order Tool
 *
 * MCP tool for amending an existing order's price and/or count.
 *
 * @module tools/amend-order
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { OrdersApi } from "kalshi-typescript";
import { z } from "zod";

const AmendOrderSchema = z.object({
  order_id: z.string().describe("Order ID to amend"),
  ticker: z.string().describe("Market ticker"),
  side: z.enum(["yes", "no"]).describe("Side of the order"),
  action: z.enum(["buy", "sell"]).describe("Action: buy or sell"),
  client_order_id: z.string().describe("Original client order ID"),
  updated_client_order_id: z.string().describe("New client order ID for the amended order"),
  yes_price: z.number().optional().describe("Updated yes price in cents (optional)"),
  no_price: z.number().optional().describe("Updated no price in cents (optional)"),
  count: z.number().optional().describe("Updated contract count (optional)"),
});

type AmendOrderInput = z.infer<typeof AmendOrderSchema>;

export function registerAmendOrder(server: McpServer, api: OrdersApi) {
  server.tool(
    "amend_order",
    "Amend an existing order's price and/or max fillable contracts. CAUTION: Modifies a live order.",
    AmendOrderSchema.shape,
    async (params: AmendOrderInput) => {
      try {
        const body: Record<string, unknown> = {
          ticker: params.ticker,
          side: params.side,
          action: params.action,
          client_order_id: params.client_order_id,
          updated_client_order_id: params.updated_client_order_id,
        };
        if (params.yes_price !== undefined) body.yes_price = params.yes_price;
        if (params.no_price !== undefined) body.no_price = params.no_price;
        if (params.count !== undefined) body.count = params.count;
        const response = await api.amendOrder(params.order_id, body as any);
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(response.data, null, 2),
            },
          ],
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error occurred";
        return {
          content: [{ type: "text" as const, text: `Error amending order: ${message}` }],
          isError: true,
        };
      }
    }
  );
}
