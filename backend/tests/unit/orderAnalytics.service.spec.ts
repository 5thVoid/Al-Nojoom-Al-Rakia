import { orderAnalyticsService } from "../../services/orderAnalytics.service";
import { Order, OrderItem } from "../../types";

describe("OrderAnalyticsService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns aggregated metrics", async () => {
    jest.spyOn(Order, "findOne").mockResolvedValue({
      orderCount: "5",
      totalRevenue: "500.50",
      averageOrderValue: "100.10",
    } as any);

    jest.spyOn(OrderItem, "findOne").mockResolvedValue({ itemsSold: "12" } as any);

    const summary = await orderAnalyticsService.getSummary({ period: "all" });

    expect(summary).toEqual({
      totalOrders: 5,
      totalRevenue: 500.5,
      averageOrderValue: 100.1,
      itemsSold: 12,
    });
  });
});
