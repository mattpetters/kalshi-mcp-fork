/**
 * Get Multivariate Events Tool
 *
 * MCP tool for listing multivariate/combo events.
 *
 * @module tools/get-multivariate-events
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { EventsApi } from "kalshi-typescript";
import { z } from "zod";

const GetMultivariateEventsSchema = z.object({
  limit: z.number().optional().describe("Results per page (optional)"),
  cursor: z.string().optional().describe("Pagination cursor (optional)"),
  series_ticker: z.string().optional().describe("Series ticker filter (optional)"),
  collection_id: z.string().optional().describe("Collection ID filter (optional)"),
});

type GetMultivariateEventsInput = z.infer<typeof GetMultivariateEventsSchema>;

export function registerGetMultivariateEvents(server: McpServer, api: EventsApi) {
  server.tool(
    "get_multivariate_events",
    "List multivariate events (combo/parlay markets). Useful for discovering packaged multi-leg bets.",
    GetMultivariateEventsSchema.shape,
    async (params: GetMultivariateEventsInput) => {
      try {
        const response = await api.getMultivariateEvents(
          params.limit,
          params.cursor,
          params.series_ticker,
          params.collection_id
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
          content: [{ type: "text" as const, text: `Error fetching multivariate events: ${message}` }],
          isError: true,
        };
      }
    }
  );
}
