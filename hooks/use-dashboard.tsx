import { dashboardApi } from '@/lib/api-helper';
import { DetailsResponse } from '@/types';
import {
  DashboardCalculationsType,
  DashboardRecentOrderType,
} from '@/types/dashboard.type';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

export function useDashboardCalculations() {
  const fetchDashboardCalculations = useQuery<
    DetailsResponse<DashboardCalculationsType>
  >({
    queryKey: ['dashboard-calculations'],
    queryFn: async () => {
      const res = await dashboardApi
        .getDashboardCalculations()
        .then((res) => res.data);
      return res;
    },
    placeholderData: keepPreviousData,
  });

  return {
    dashboardCalculations: fetchDashboardCalculations.data?.data,
    dashboardCalculationsLoading: fetchDashboardCalculations.isLoading,
    dashboardCalculationsIsError: fetchDashboardCalculations.isError,
  };
}
export function useDashboardRecentOrders(limit?: number) {
  const fetchDashboardRecentOrders = useQuery<
    DetailsResponse<DashboardRecentOrderType>
  >({
    queryKey: ['dashboard-recent-orders', limit],
    queryFn: async () => {
      const res = await dashboardApi
        .getDashboardRecentOrders(limit)
        .then((res) => res.data);
      return res;
    },
    placeholderData: keepPreviousData,
  });
  return {
    dashboardRecentOrders: fetchDashboardRecentOrders.data?.data,
    dashboardRecentOrdersIsLoading: fetchDashboardRecentOrders.isLoading,
    dashboardRecentOrdersIsError: fetchDashboardRecentOrders.isError,
  };
}
export function useDashboardStatistics(year?: number) {
  const fetchDashboardStatistics = useQuery({
    queryKey: ['dashboard-statistics', year],
    queryFn: async () => {
      const res = await dashboardApi

        .getDashboardStatistics(year)
        .then((res) => res.data);
      return res;
    },
  });
  return {
    dashboardStatistics: fetchDashboardStatistics.data?.data,
    dashboardStatisticsIsLoading: fetchDashboardStatistics.isLoading,
    dashboardStatisticsIsError: fetchDashboardStatistics.isError,
  };
}
