import { DetailsResponse } from '@/types';
import { axiosInstanceWithAuth } from '../axios';
import {
  DashboardCalculationsType,
  DashboardRecentOrderType,
  DashboardStatisticsType,
} from '@/types/dashboard.type';

export const dashboardApi = {
  getDashboardCalculations: () => {
    const url = '/protected/dashboard/dashboard-calculation';
    return axiosInstanceWithAuth.get<
      DetailsResponse<DashboardCalculationsType>
    >(url);
  },
  getDashboardRecentOrders: (limit?: number) => {
    const url = '/protected/dashboard/dashboard-recent-orders';
    return axiosInstanceWithAuth.get<DetailsResponse<DashboardRecentOrderType>>(
      url,
      {
        params: { limit },
      }
    );
  },
  getDashboardStatistics: (year?: number) => {
    const url = '/protected/dashboard/dashboard-statistics';
    return axiosInstanceWithAuth.get<DetailsResponse<DashboardStatisticsType>>(
      url,
      {
        params: { year },
      }
    );
  },
};
