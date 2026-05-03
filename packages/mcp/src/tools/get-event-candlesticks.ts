/**
 * Get Event Candlesticks Tool
 *
 * MCP tool for fetching candlestick data for all markets in an event.
 *
 * @module tools/get-event-candlesticks
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { EventsApi } from "kalshi-typescript";
import { z } from "zod";

const GetEventCandlesticksSchema = z.object({
  ticker: z.string().describe("Event ticker"),
  series_ticker: z.string().describe("Series ticker"),
  start_ts: z.number().describe("Start timestamp (Unix ms)"),
  end_ts: z.number().describe("End timestamp (Unix ms)"),
  period: z.number().optional().describe("Period in minutes (optional)"),
});

type GetEventCandlesticksInput = z.infer<typeof GetEventCandlesticksSchema>;

export function registerGetEventCandlesticks(server: McpServer, api: EventsApi) {
  server.tool(
    "get_event_candlesticks",
    "Get candlestick data for all markets within an event.",
    GetEventCandlesticksSchema.shape,
    async (params: GetEventCandlesticksInput) => {
      try {
        const response = await api.getMarketCandlesticksByEvent(
          params.ticker,
          params.series_ticker,
          params.start_ts,
          params.end_ts,
          params.period as any
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
          content: [{ type: "text" as const, text: `Error fetching event candlesticks: ${message}` }],
          isError: true,
        };
      }
    }
  );
}
