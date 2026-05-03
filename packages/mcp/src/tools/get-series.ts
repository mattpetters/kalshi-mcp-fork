/**
 * Get Series Tool
 *
 * MCP tool for fetching details about a specific market series.
 *
 * @module tools/get-series
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { MarketApi } from "kalshi-typescript";
import { z } from "zod";

const GetSeriesSchema = z.object({
  series_ticker: z.string().describe("Series ticker (e.g., 'MLB')"),
});

type GetSeriesInput = z.infer<typeof GetSeriesSchema>;

export function registerGetSeries(server: McpServer, api: MarketApi) {
  server.tool(
    "get_series",
    "Get detailed information about a specific market series.",
    GetSeriesSchema.shape,
    async (params: GetSeriesInput) => {
      try {
        const response = await api.getSeries(params.series_ticker);
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
          content: [{ type: "text" as const, text: `Error fetching series: ${message}` }],
          isError: true,
        };
      }
    }
  );
}
