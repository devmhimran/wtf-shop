'use client';

import { useGetCustomerOrderCalculations } from '@/hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ShoppingBag,
  DollarSign,
  TrendingUp,
  Truck,
  CheckCircle,
  Clock,
} from 'lucide-react';

import { CustomerOrderCalculationsSkeleton } from '@/components/skeletons';

export function CustomerOrderCalculations() {
  const {
    fetchAllCustomerOrderCalculationsMutationData,
    fetchAllCustomerOrderCalculationsMutation,
  } = useGetCustomerOrderCalculations();

  const isLoading = fetchAllCustomerOrderCalculationsMutation.isLoading;
  const data = fetchAllCustomerOrderCalculationsMutationData?.data;

  if (isLoading) {
    return <CustomerOrderCalculationsSkeleton />;
  }

  const summary = data?.summary;

  const stats = [
    {
      title: 'Total Orders',
      value: summary?.totalOrders || 0,
      description: 'Lifetime orders',
      icon: ShoppingBag,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Total Spent',
      value: `AU$${summary?.totalSpent?.toFixed(2) || '0.00'}`,
      description: 'All-time spending',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Average Order',
      value: `AU$${summary?.averageOrderValue?.toFixed(2) || '0.00'}`,
      description: 'Per order value',
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Shipping Paid',
      value: `AU$${summary?.totalShippingPaid?.toFixed(2) || '0.00'}`,
      description: 'Total shipping costs',
      icon: Truck,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      title: 'Active Orders',
      value: summary?.activeOrdersCount || 0,
      description: 'In progress',
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      title: 'Delivered Orders',
      value: summary?.completedOrdersCount || 0,
      description: 'Successfully delivered',
      icon: CheckCircle,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
    },
  ];

  return (
    <div className='space-y-6'>
      {/* Stats Grid */}
      <div className='grid gap-4 grid-cols-2 md:grid-cols-3'>
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card
              key={index}
              className='hover:shadow-md transition-shadow cursor-pointer'
            >
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  {stat.title}
                </CardTitle>
                <div className={`${stat.bgColor} p-2 rounded-lg`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>{stat.value}</div>
                <p className='text-xs text-muted-foreground mt-1'>
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {!summary?.totalOrders && (
        <Card className='border-dashed'>
          <CardContent className='flex flex-col items-center justify-center py-12'>
            <ShoppingBag className='h-12 w-12 text-muted-foreground mb-4 opacity-50' />
            <p className='text-lg font-medium text-muted-foreground'>
              No order data available
            </p>
            <p className='text-sm text-muted-foreground'>
              Start shopping to see your order statistics
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
