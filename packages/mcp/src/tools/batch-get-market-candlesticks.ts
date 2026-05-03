/**
 * Batch Get Market Candlesticks Tool
 *
 * MCP tool for fetching candlestick data for multiple markets at once.
 *
 * @module tools/batch-get-market-candlesticks
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { MarketApi } from "kalshi-typescript";
import { z } from "zod";

const BatchGetMarketCandlesticksSchema = z.object({
  market_tickers: z.string().describe("Comma-separated market tickers"),
  start_ts: z.number().describe("Start timestamp (Unix ms)"),
  end_ts: z.number().describe("End timestamp (Unix ms)"),
  period: z.number().describe("Candlestick period in minutes (required)"),
});

type BatchGetMarketCandlesticksInput = z.infer<typeof BatchGetMarketCandlesticksSchema>;

export function registerBatchGetMarketCandlesticks(server: McpServer, api: MarketApi) {
  server.tool(
    "batch_get_market_candlesticks",
    "Get OHLC candlestick data for multiple markets in a single request.",
    BatchGetMarketCandlesticksSchema.shape,
    async (params: BatchGetMarketCandlesticksInput) => {
      try {
        const response = await api.batchGetMarketCandlesticks(
          params.market_tickers,
          params.start_ts,
          params.end_ts,
          params.period
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
