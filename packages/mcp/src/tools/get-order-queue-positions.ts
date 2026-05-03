/**
 * Get Order Queue Positions Tool
 *
 * MCP tool for checking queue positions of all resting orders.
 *
 * @module tools/get-order-queue-positions
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { OrdersApi } from "kalshi-typescript";
import { z } from "zod";

const GetOrderQueuePositionsSchema = z.object({
  market_tickers: z.string().optional().describe("Comma-separated market tickers to filter (optional)"),
  event_ticker: z.string().optional().describe("Event ticker to filter (optional)"),
});

type GetOrderQueuePositionsInput = z.infer<typeof GetOrderQueuePositionsSchema>;

export function registerGetOrderQueuePositions(server: McpServer, api: OrdersApi) {
  server.tool(
    "get_order_queue_positions",
    "Get queue positions for all resting orders. Filter by market tickers or event ticker.",
    GetOrderQueuePositionsSchema.shape,
    async (params: GetOrderQueuePositionsInput) => {
      try {
        const response = await api.getOrderQueuePositions(params.market_tickers, params.event_ticker);
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
          content: [{ type: "text" as const, text: `Error fetching queue positions: ${message}` }],
          isError: true,
        };
      }
    }
  );
}
