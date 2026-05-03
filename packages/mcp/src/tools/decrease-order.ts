/**
 * Decrease Order Tool
 *
 * MCP tool for reducing the number of contracts in an existing order.
 *
 * @module tools/decrease-order
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { OrdersApi } from "kalshi-typescript";
import { z } from "zod";

const DecreaseOrderSchema = z.object({
  order_id: z.string().describe("Order ID to decrease"),
  reduce_by: z.number().min(1).optional().describe("Reduce order by this many contracts (optional, use reduce_by OR reduce_to)"),
  reduce_to: z.number().min(0).optional().describe("Reduce order to this many remaining contracts (optional, use reduce_by OR reduce_to)"),
});

type DecreaseOrderInput = z.infer<typeof DecreaseOrderSchema>;

export function registerDecreaseOrder(server: McpServer, api: OrdersApi) {
  server.tool(
    "decrease_order",
    "Decrease the number of contracts in an existing order. Use reduce_by to subtract contracts, or reduce_to to set the remaining count. Cancelling is equivalent to reducing to zero.",
    DecreaseOrderSchema.shape,
    async (params: DecreaseOrderInput) => {
      try {
        const body: Record<string, unknown> = {};
        if (params.reduce_by !== undefined) body.reduce_by = params.reduce_by;
        if (params.reduce_to !== undefined) body.reduce_to = params.reduce_to;
        const response = await api.decreaseOrder(params.order_id, body as any);
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
          content: [{ type: "text" as const, text: `Error decreasing order: ${message}` }],
          isError: true,
        };
      }
    }
  );
}
