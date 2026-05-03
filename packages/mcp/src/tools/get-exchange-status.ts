/**
 * Get Exchange Status Tool
 *
 * MCP tool for checking if the Kalshi exchange is open.
 *
 * @module tools/get-exchange-status
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ExchangeApi } from "kalshi-typescript";
import { z } from "zod";

const GetExchangeStatusSchema = z.object({});

export function registerGetExchangeStatus(server: McpServer, api: ExchangeApi) {
  server.tool(
    "get_exchange_status",
    "Get the current status of the Kalshi exchange (open, closed, pre-open, etc.).",
    GetExchangeStatusSchema.shape,
    async () => {
      try {
        const response = await api.getExchangeStatus();
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
          content: [{ type: "text" as const, text: `Error fetching exchange status: ${message}` }],
          isError: true,
        };
      }
    }
  );
}
