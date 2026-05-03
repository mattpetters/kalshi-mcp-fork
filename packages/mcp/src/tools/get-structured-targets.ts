/**
 * Get Structured Targets Tool
 *
 * MCP tool for listing available structured target markets.
 *
 * @module tools/get-structured-targets
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StructuredTargetsApi } from "kalshi-typescript";
import { z } from "zod";

const GetStructuredTargetsSchema = z.object({
  type: z.string().optional().describe("Target type filter (optional)"),
  competition: z.string().optional().describe("Competition filter (optional)"),
  page_size: z.number().optional().describe("Page size (optional)"),
  cursor: z.string().optional().describe("Pagination cursor (optional)"),
});

type GetStructuredTargetsInput = z.infer<typeof GetStructuredTargetsSchema>;

export function registerGetStructuredTargets(server: McpServer, api: StructuredTargetsApi) {
  server.tool(
    "get_structured_targets",
    "List available structured target markets.",
    GetStructuredTargetsSchema.shape,
    async (params: GetStructuredTargetsInput) => {
      try {
        const response = await api.getStructuredTargets(params.type, params.competition, params.page_size, params.cursor);
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
          content: [{ type: "text" as const, text: `Error fetching structured targets: ${message}` }],
          isError: true,
        };
      }
    }
  );
}
