/**
 * Get Series List Tool
 *
 * MCP tool for listing available market series.
 *
 * @module tools/get-series-list
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { MarketApi } from "kalshi-typescript";
import { z } from "zod";

const GetSeriesListSchema = z.object({
  category: z.string().optional().describe("Category filter (optional)"),
  tags: z.string().optional().describe("Tags filter (optional)"),
  include_product_metadata: z.boolean().optional().describe("Include product metadata (optional)"),
});

type GetSeriesListInput = z.infer<typeof GetSeriesListSchema>;

export function registerGetSeriesList(server: McpServer, api: MarketApi) {
  server.tool(
    "get_series_list",
    "List available market series with optional filtering by category and tags.",
    GetSeriesListSchema.shape,
    async (params: GetSeriesListInput) => {
      try {
        const response = await api.getSeriesList(
          params.category,
          params.tags,
          params.include_product_metadata
        );
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
          content: [{ type: "text" as const, text: `Error fetching series list: ${message}` }],
          isError: true,
        };
      }
    }
  );
}
