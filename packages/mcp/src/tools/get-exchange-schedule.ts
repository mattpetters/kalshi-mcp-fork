/**
 * Get Exchange Schedule Tool
 *
 * MCP tool for fetching the Kalshi trading schedule.
 *
 * @module tools/get-exchange-schedule
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ExchangeApi } from "kalshi-typescript";
import { z } from "zod";

const GetExchangeScheduleSchema = z.object({});

export function registerGetExchangeSchedule(server: McpServer, api: ExchangeApi) {
  server.tool(
    "get_exchange_schedule",
    "Get the Kalshi exchange trading schedule including regular and holiday hours.",
    GetExchangeScheduleSchema.shape,
    async () => {
      try {
        const response = await api.getExchangeSchedule();
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
          content: [{ type: "text" as const, text: `Error fetching exchange schedule: ${message}` }],
          isError: true,
        };
      }
    }
  );
}
