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
    isLoading: fetchDashboardCalculations.isLoading,
    isError: fetchDashboardCalculations.isError,
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
    isLoading: fetchDashboardRecentOrders.isLoading,
    isError: fetchDashboardRecentOrders.isError,
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
    isLoading: fetchDashboardStatistics.isLoading,
    isError: fetchDashboardStatistics.isError,
  };
}
