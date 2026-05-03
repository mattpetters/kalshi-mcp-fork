/**
 * Get Tags For Series Categories Tool
 *
 * MCP tool for fetching tags available for series categories.
 *
 * @module tools/get-tags-for-series-categories
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SearchApi } from "kalshi-typescript";
import { z } from "zod";

const GetTagsForSeriesCategoriesSchema = z.object({});

export function registerGetTagsForSeriesCategories(server: McpServer, api: SearchApi) {
  server.tool(
    "get_tags_for_series_categories",
    "Get tags available for series categories. Useful for discovering market categories.",
    GetTagsForSeriesCategoriesSchema.shape,
    async () => {
      try {
        const response = await api.getTagsForSeriesCategories();
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
          content: [{ type: "text" as const, text: `Error fetching tags: ${message}` }],
          isError: true,
        };
      }
    }
  );
}
