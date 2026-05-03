/**
 * Batch Create Orders Tool
 *
 * MCP tool for submitting up to 20 orders in a single batch.
 *
 * @module tools/batch-create-orders
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { OrdersApi } from "kalshi-typescript";
import { z } from "zod";

const BatchCreateOrdersSchema = z.object({
  orders: z.string().describe("JSON array of order objects. Each object needs: ticker, side ('yes'|'no'), action ('buy'|'sell'), count, type ('limit'|'market'), and yes_price or no_price in cents."),
});

type BatchCreateOrdersInput = z.infer<typeof BatchCreateOrdersSchema>;

export function registerBatchCreateOrders(server: McpServer, api: OrdersApi) {
  server.tool(
    "batch_create_orders",
    "Submit up to 20 orders in a single batch request. CAUTION: This will execute real trades with real money.",
    BatchCreateOrdersSchema.shape,
    async (params: BatchCreateOrdersInput) => {
      try {
        const orders = JSON.parse(params.orders);
        const response = await api.batchCreateOrders({ orders });
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
          content: [{ type: "text" as const, text: `Error batch creating orders: ${message}` }],
          isError: true,
        };
      }
    }
  );
}
