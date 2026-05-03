/**
 * Get Live Data Tool
 *
 * MCP tool for fetching live data for a milestone.
 *
 * @module tools/get-live-data
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { LiveDataApi } from "kalshi-typescript";
import { z } from "zod";

const GetLiveDataSchema = z.object({
  type: z.string().describe("Live data type (e.g., 'sports')"),
  milestone_id: z.string().describe("Milestone ID"),
});

type GetLiveDataInput = z.infer<typeof GetLiveDataSchema>;

export function registerGetLiveData(server: McpServer, api: LiveDataApi) {
  server.tool(
    "get_live_data",
    "Get live data (scores, stats, status) for a specific milestone.",
    GetLiveDataSchema.shape,
    async (params: GetLiveDataInput) => {
      try {
        const response = await api.getLiveData(params.type, params.milestone_id);
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
          content: [{ type: "text" as const, text: `Error fetching live data: ${message}` }],
          isError: true,
        };
      }
    }
  );
}
