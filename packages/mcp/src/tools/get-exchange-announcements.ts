/**
 * Get Exchange Announcements Tool
 *
 * MCP tool for fetching recent exchange announcements.
 *
 * @module tools/get-exchange-announcements
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ExchangeApi } from "kalshi-typescript";
import { z } from "zod";

const GetExchangeAnnouncementsSchema = z.object({});

export function registerGetExchangeAnnouncements(server: McpServer, api: ExchangeApi) {
  server.tool(
    "get_exchange_announcements",
    "Get recent announcements from the Kalshi exchange.",
    GetExchangeAnnouncementsSchema.shape,
    async () => {
      try {
        const response = await api.getExchangeAnnouncements();
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
          content: [{ type: "text" as const, text: `Error fetching announcements: ${message}` }],
          isError: true,
        };
      }
    }
  );
}
