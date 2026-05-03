/**
 * Get Event Metadata Tool
 *
 * MCP tool for fetching metadata about a specific event.
 *
 * @module tools/get-event-metadata
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { EventsApi } from "kalshi-typescript";
import { z } from "zod";

const GetEventMetadataSchema = z.object({
  event_ticker: z.string().describe("Event ticker"),
});

type GetEventMetadataInput = z.infer<typeof GetEventMetadataSchema>;

export function registerGetEventMetadata(server: McpServer, api: EventsApi) {
  server.tool(
    "get_event_metadata",
    "Get metadata for a specific event including description, rules, and associated markets.",
    GetEventMetadataSchema.shape,
    async (params: GetEventMetadataInput) => {
      try {
        const response = await api.getEventMetadata(params.event_ticker);
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
          content: [{ type: "text" as const, text: `Error fetching event metadata: ${message}` }],
          isError: true,
        };
      }
    }
  );
}
