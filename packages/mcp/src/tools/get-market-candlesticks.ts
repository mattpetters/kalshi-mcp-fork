/**
 * Get Market Candlesticks Tool
 *
 * MCP tool for fetching OHLC candlestick data for a market.
 *
 * @module tools/get-market-candlesticks
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { MarketApi } from "kalshi-typescript";
import { z } from "zod";

const GetMarketCandlesticksSchema = z.object({
  series_ticker: z.string().describe("Series ticker (e.g., 'MLB')"),
  ticker: z.string().describe("Market ticker"),
  start_ts: z.number().describe("Start timestamp (Unix ms)"),
  end_ts: z.number().describe("End timestamp (Unix ms)"),
  period: z.number().optional().describe("Candlestick period in minutes (optional)"),
});

type GetMarketCandlesticksInput = z.infer<typeof GetMarketCandlesticksSchema>;

export function registerGetMarketCandlesticks(server: McpServer, api: MarketApi) {
  server.tool(
    "get_market_candlesticks",
    "Get OHLC candlestick data for a specific market. Useful for price history and trend analysis.",
    GetMarketCandlesticksSchema.shape,
    async (params: GetMarketCandlesticksInput) => {
      try {
        const response = await api.getMarketCandlesticks(
          params.series_ticker,
          params.ticker,
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
          content: [{ type: "text" as const, text: `Error fetching candlesticks: ${message}` }],
          isError: true,
        };
      }
    }
  );
}
