/**
 * Get Order Queue Position Tool
 *
 * MCP tool for checking where a resting order sits in the order book.
 *
 * @module tools/get-order-queue-position
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { OrdersApi } from "kalshi-typescript";
import { z } from "zod";

const GetOrderQueuePositionSchema = z.object({
  order_id: z.string().describe("Order ID to check queue position for"),
});

type GetOrderQueuePositionInput = z.infer<typeof GetOrderQueuePositionSchema>;

export function registerGetOrderQueuePosition(server: McpServer, api: OrdersApi) {
  server.tool(
    "get_order_queue_position",
    "Get the queue position of a single resting order. Shows how many contracts need to be matched before this order fills.",
    GetOrderQueuePositionSchema.shape,
    async (params: GetOrderQueuePositionInput) => {
      try {
        const response = await api.getOrderQueuePosition(params.order_id);
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
          content: [{ type: "text" as const, text: `Error fetching queue position: ${message}` }],
          isError: true,
        };
      }
    }
  );
}
