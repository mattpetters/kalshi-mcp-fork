/**
 * Get Structured Target Tool
 *
 * MCP tool for fetching a specific structured target.
 *
 * @module tools/get-structured-target
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StructuredTargetsApi } from "kalshi-typescript";
import { z } from "zod";

const GetStructuredTargetSchema = z.object({
  target_id: z.string().describe("Target ID"),
});

type GetStructuredTargetInput = z.infer<typeof GetStructuredTargetSchema>;

export function registerGetStructuredTarget(server: McpServer, api: StructuredTargetsApi) {
  server.tool(
    "get_structured_target",
    "Get details about a specific structured target market.",
    GetStructuredTargetSchema.shape,
    async (params: GetStructuredTargetInput) => {
      try {
        const response = await api.getStructuredTarget(params.target_id);
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
          content: [{ type: "text" as const, text: `Error fetching structured target: ${message}` }],
          isError: true,
        };
      }
    }
  );
}
