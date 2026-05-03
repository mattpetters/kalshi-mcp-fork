/**
 * Get Filters For Sports Tool
 *
 * MCP tool for fetching available sports filters.
 *
 * @module tools/get-filters-for-sports
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SearchApi } from "kalshi-typescript";
import { z } from "zod";

const GetFiltersForSportsSchema = z.object({});

export function registerGetFiltersForSports(server: McpServer, api: SearchApi) {
  server.tool(
    "get_filters_for_sports",
    "Get available sports filters for market discovery.",
    GetFiltersForSportsSchema.shape,
    async () => {
      try {
        const response = await api.getFiltersForSports();
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
          content: [{ type: "text" as const, text: `Error fetching sports filters: ${message}` }],
          isError: true,
        };
      }
    }
  );
}
