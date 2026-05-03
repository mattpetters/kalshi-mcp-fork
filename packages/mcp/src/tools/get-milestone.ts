/**
 * Get Milestone Tool
 *
 * MCP tool for fetching a specific milestone.
 *
 * @module tools/get-milestone
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { MilestoneApi } from "kalshi-typescript";
import { z } from "zod";

const GetMilestoneSchema = z.object({
  milestone_id: z.string().describe("Milestone ID"),
});

type GetMilestoneInput = z.infer<typeof GetMilestoneSchema>;

export function registerGetMilestone(server: McpServer, api: MilestoneApi) {
  server.tool(
    "get_milestone",
    "Get details about a specific milestone market.",
    GetMilestoneSchema.shape,
    async (params: GetMilestoneInput) => {
      try {
        const response = await api.getMilestone(params.milestone_id);
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
          content: [{ type: "text" as const, text: `Error fetching milestone: ${message}` }],
          isError: true,
        };
      }
    }
  );
}
