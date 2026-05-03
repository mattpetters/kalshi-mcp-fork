/**
 * Get Live Datas Tool
 *
 * MCP tool for fetching live data for multiple milestones.
 *
 * @module tools/get-live-datas
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { LiveDataApi } from "kalshi-typescript";
import { z } from "zod";

const GetLiveDatasSchema = z.object({
  milestone_ids: z.string().describe("Comma-separated milestone IDs"),
});

type GetLiveDatasInput = z.infer<typeof GetLiveDatasSchema>;

export function registerGetLiveDatas(server: McpServer, api: LiveDataApi) {
  server.tool(
    "get_live_datas",
    "Get live data for multiple milestones in a single request.",
    GetLiveDatasSchema.shape,
    async (params: GetLiveDatasInput) => {
      try {
        const ids = params.milestone_ids.split(",").map((s) => s.trim());
        const response = await api.getLiveDatas(ids);
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
          content: [{ type: "text" as const, text: `Error fetching live datas: ${message}` }],
          isError: true,
        };
      }
    }
  );
}
