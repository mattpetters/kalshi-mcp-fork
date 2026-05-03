/**
 * Get Milestones Tool
 *
 * MCP tool for listing available milestone markets.
 *
 * @module tools/get-milestones
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { MilestoneApi } from "kalshi-typescript";
import { z } from "zod";

const GetMilestonesSchema = z.object({
  limit: z.number().min(1).max(1000).describe("Results per page (required, max 1000)"),
  cursor: z.string().optional().describe("Pagination cursor (optional)"),
});

type GetMilestonesInput = z.infer<typeof GetMilestonesSchema>;

export function registerGetMilestones(server: McpServer, api: MilestoneApi) {
  server.tool(
    "get_milestones",
    "List available milestone markets.",
    GetMilestonesSchema.shape,
    async (params: GetMilestonesInput) => {
      try {
        const response = await api.getMilestones(params.limit, undefined, undefined, undefined, undefined, undefined, undefined, params.cursor);
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
          content: [{ type: "text" as const, text: `Error fetching milestones: ${message}` }],
          isError: true,
        };
      }
    }
  );
}
