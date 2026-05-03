/**
 * Get Order Tool
 *
 * MCP tool for fetching a specific order by ID.
 *
 * @module tools/get-order
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { OrdersApi } from "kalshi-typescript";
import { z } from "zod";

const GetOrderSchema = z.object({
  order_id: z.string().describe("The order ID to look up"),
});

type GetOrderInput = z.infer<typeof GetOrderSchema>;

export function registerGetOrder(server: McpServer, api: OrdersApi) {
  server.tool(
    "get_order",
    "Get detailed information about a specific order by its ID. Returns order status, fills, remaining count, and pricing.",
    GetOrderSchema.shape,
    async (params: GetOrderInput) => {
      try {
        const response = await api.getOrder(params.order_id);
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
          content: [{ type: "text" as const, text: `Error fetching order: ${message}` }],
          isError: true,
        };
      }
    }
  );
}
