/**
 * Kalshi MCP Server
 *
 * MCP server for interacting with Kalshi prediction markets via AI assistants.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import {
  createMarketApi,
  createPortfolioApi,
  createOrdersApi,
  createEventsApi,
  createExchangeApi,
  createLiveDataApi,
  createMilestoneApi,
  createStructuredTargetsApi,
  createSearchApi,
} from "./config.js";

// Market tools
import { registerGetMarkets } from "./tools/get-markets.js";
import { registerGetMarket } from "./tools/get-market.js";
import { registerGetOrderbook } from "./tools/get-orderbook.js";
import { registerGetTrades } from "./tools/get-trades.js";
import { registerGetMarketCandlesticks } from "./tools/get-market-candlesticks.js";
import { registerBatchGetMarketCandlesticks } from "./tools/batch-get-market-candlesticks.js";
import { registerGetSeries } from "./tools/get-series.js";
import { registerGetSeriesList } from "./tools/get-series-list.js";

// Event tools
import { registerGetEvents } from "./tools/get-events.js";
import { registerGetEvent } from "./tools/get-event.js";
import { registerGetEventMetadata } from "./tools/get-event-metadata.js";
import { registerGetEventCandlesticks } from "./tools/get-event-candlesticks.js";
import { registerGetMultivariateEvents } from "./tools/get-multivariate-events.js";

// Portfolio tools
import { registerGetBalance } from "./tools/get-balance.js";
import { registerGetPositions } from "./tools/get-positions.js";

// Order tools
import { registerGetOrders } from "./tools/get-orders.js";
import { registerGetOrder } from "./tools/get-order.js";
import { registerCreateOrder } from "./tools/create-order.js";
import { registerCreateOrderV2 } from "./tools/create-order-v2.js";
import { registerCancelOrder } from "./tools/cancel-order.js";
import { registerBatchCancelOrders } from "./tools/batch-cancel-orders.js";
import { registerAmendOrder } from "./tools/amend-order.js";
import { registerDecreaseOrder } from "./tools/decrease-order.js";
import { registerBatchCreateOrders } from "./tools/batch-create-orders.js";
import { registerGetOrderQueuePosition } from "./tools/get-order-queue-position.js";
import { registerGetOrderQueuePositions } from "./tools/get-order-queue-positions.js";

// Fill and settlement tools
import { registerGetFills } from "./tools/get-fills.js";
import { registerGetSettlements } from "./tools/get-settlements.js";

// Exchange tools
import { registerGetExchangeStatus } from "./tools/get-exchange-status.js";
import { registerGetExchangeSchedule } from "./tools/get-exchange-schedule.js";
import { registerGetExchangeAnnouncements } from "./tools/get-exchange-announcements.js";

// Live data tools
import { registerGetLiveData } from "./tools/get-live-data.js";
import { registerGetLiveDatas } from "./tools/get-live-datas.js";

// Milestone tools
import { registerGetMilestone } from "./tools/get-milestone.js";
import { registerGetMilestones } from "./tools/get-milestones.js";

// Structured target tools
import { registerGetStructuredTarget } from "./tools/get-structured-target.js";
import { registerGetStructuredTargets } from "./tools/get-structured-targets.js";

// Search tools
import { registerGetFiltersForSports } from "./tools/get-filters-for-sports.js";
import { registerGetTagsForSeriesCategories } from "./tools/get-tags-for-series-categories.js";

export const SERVER_NAME = "kalshi-mcp";
export const SERVER_VERSION = "0.6.0";

/**
 * Configuration schema for Kalshi API authentication
 */
export const configSchema = z.object({
  KALSHI_API_KEY: z.string().describe("Your Kalshi API key ID"),
  KALSHI_PRIVATE_KEY: z
    .string()
    .describe("RSA private key in PEM format for API authentication"),
});

export type Config = z.infer<typeof configSchema>;

interface CreateServerOptions {
  config?: Config;
}

/**
 * Creates and configures the Kalshi MCP server
 *
 * @param options - Server options including config object or environment variables
 * @returns Configured MCP server instance
 */
export default function createServer(options: CreateServerOptions = {}) {
  // Get config from options or fall back to environment variables
  const apiKey = options.config?.KALSHI_API_KEY || process.env.KALSHI_API_KEY;
  const privateKey =
    options.config?.KALSHI_PRIVATE_KEY || process.env.KALSHI_PRIVATE_KEY;

  if (!apiKey || !privateKey) {
    throw new Error(
      "Missing Kalshi credentials. Provide KALSHI_API_KEY and KALSHI_PRIVATE_KEY via config or environment variables."
    );
  }

  // Create Kalshi SDK configuration
  const basePath =
    process.env.KALSHI_BASE_PATH ||
    "https://api.elections.kalshi.com/trade-api/v2";

  const kalshiConfig = {
    apiKey,
    privateKey: privateKey,
    basePath,
  };

  // Initialize API clients
  const marketApi = createMarketApi(kalshiConfig);
  const portfolioApi = createPortfolioApi(kalshiConfig);
  const ordersApi = createOrdersApi(kalshiConfig);
  const eventsApi = createEventsApi(kalshiConfig);
  const exchangeApi = createExchangeApi(kalshiConfig);
  const liveDataApi = createLiveDataApi(kalshiConfig);
  const milestoneApi = createMilestoneApi(kalshiConfig);
  const structuredTargetsApi = createStructuredTargetsApi(kalshiConfig);
  const searchApi = createSearchApi(kalshiConfig);

  // Create MCP server
  const server = new McpServer({
    name: SERVER_NAME,
    version: SERVER_VERSION,
  });

  // Register market tools
  registerGetMarkets(server, marketApi);
  registerGetMarket(server, marketApi);
  registerGetOrderbook(server, marketApi);
  registerGetTrades(server, marketApi);
  registerGetMarketCandlesticks(server, marketApi);
  registerBatchGetMarketCandlesticks(server, marketApi);
  registerGetSeries(server, marketApi);
  registerGetSeriesList(server, marketApi);

  // Register event tools
  registerGetEvents(server, eventsApi);
  registerGetEvent(server, eventsApi);
  registerGetEventMetadata(server, eventsApi);
  registerGetEventCandlesticks(server, eventsApi);
  registerGetMultivariateEvents(server, eventsApi);

  // Register portfolio tools
  registerGetBalance(server, portfolioApi);
  registerGetPositions(server, portfolioApi);

  // Register order tools
  registerGetOrders(server, ordersApi);
  registerGetOrder(server, ordersApi);
  registerCreateOrder(server, ordersApi, marketApi, portfolioApi);
  registerCreateOrderV2(server, apiKey, privateKey, basePath);
  registerCancelOrder(server, ordersApi);
  registerBatchCancelOrders(server, ordersApi);
  registerAmendOrder(server, ordersApi);
  registerDecreaseOrder(server, ordersApi);
  registerBatchCreateOrders(server, ordersApi);
  registerGetOrderQueuePosition(server, ordersApi);
  registerGetOrderQueuePositions(server, ordersApi);

  // Register fill and settlement tools
  registerGetFills(server, portfolioApi);
  registerGetSettlements(server, portfolioApi);

  // Register exchange tools
  registerGetExchangeStatus(server, exchangeApi);
  registerGetExchangeSchedule(server, exchangeApi);
  registerGetExchangeAnnouncements(server, exchangeApi);

  // Register live data tools
  registerGetLiveData(server, liveDataApi);
  registerGetLiveDatas(server, liveDataApi);

  // Register milestone tools
  registerGetMilestone(server, milestoneApi);
  registerGetMilestones(server, milestoneApi);

  // Register structured target tools
  registerGetStructuredTarget(server, structuredTargetsApi);
  registerGetStructuredTargets(server, structuredTargetsApi);

  // Register search tools
  registerGetFiltersForSports(server, searchApi);
  registerGetTagsForSeriesCategories(server, searchApi);

  // Return the underlying server instance
  return server.server;
}
