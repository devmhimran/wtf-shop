import { OrdersType } from './order.types';

export type DashboardCalculationsType = {
  totalProducts: number;
  totalOrders: number;
  totalCustomers: number;
  totalSales: number;
};

export type DashboardStatisticsType = {
  year: number;
  monthlyData: {
    month: string;
    monthNumber: number;
    sales: number;
    orderCount: number;
  }[];
  totalSales: number;
  totalOrders: number;
};

export type DashboardRecentOrderType = {
  orders: OrdersType & {
    subtotal: number;
    shippingCost: number;
    createdAt: string;
    updatedAt: string;
  };
};
