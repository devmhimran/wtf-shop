'use client';

import {
  useDashboardCalculations,
  useDashboardRecentOrders,
  useDashboardStatistics,
} from '@/hooks/use-dashboard';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';
import {
  DollarSign,
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
} from 'lucide-react';
import { format } from 'date-fns';
import { orderStatusConvert, paymentStatusConvert } from '@/lib/utils';

const chartConfig = {
  sales: {
    label: 'Sales',
    color: '#FF8804',
  },
} satisfies ChartConfig;

export default function DashboardPage() {
  const currentYear = new Date().getFullYear();
  const { dashboardCalculations, dashboardCalculationsLoading } =
    useDashboardCalculations();
  const { dashboardRecentOrders, dashboardRecentOrdersIsLoading } =
    useDashboardRecentOrders(10);
  const { dashboardStatistics, dashboardStatisticsIsLoading } =
    useDashboardStatistics(currentYear);

  const stats = [
    {
      title: 'Total Products',
      value: dashboardCalculations?.totalProducts || 0,
      icon: Package,
      description: 'Active products',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Total Orders',
      value: dashboardCalculations?.totalOrders || 0,
      icon: ShoppingCart,
      description: 'All time orders',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },

    {
      title: 'Total Customers',
      value: dashboardCalculations?.totalCustomers || 0,
      icon: Users,
      description: 'Registered customers',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      title: 'Total Revenue',
      value: `AU$${dashboardCalculations?.totalSales?.toFixed(2) || '0.00'}`,
      icon: DollarSign,
      description: 'Total sales revenue',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
  ];

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-blue-100 text-blue-800',
      PROCESSING: 'bg-purple-100 text-purple-800',
      SHIPPING: 'bg-indigo-100 text-indigo-800',
      DELIVERED: 'bg-green-100 text-green-800',
      COMPLETED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
      RETURNED: 'bg-orange-100 text-orange-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PAID: 'bg-green-100 text-green-800',
      PENDING: 'bg-yellow-100 text-yellow-800',
      INCOMPLETE: 'bg-gray-100 text-gray-800',
      FAILED: 'bg-red-100 text-red-800',
      REFUNDED: 'bg-orange-100 text-orange-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className='space-y-8'>
      {/* Header */}
      <div>
        <h1 className='text-3xl font-bold tracking-tight'>Dashboard</h1>
        <p className='text-muted-foreground'>
          Welcome back! Here&apos;s an overview of your store.
        </p>
      </div>

      {/* Stats Cards */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        {dashboardCalculationsLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <Skeleton className='h-4 w-24' />
                  <Skeleton className='h-8 w-8 rounded-full' />
                </CardHeader>
                <CardContent>
                  <Skeleton className='h-8 w-32 mb-2' />
                  <Skeleton className='h-4 w-40' />
                </CardContent>
              </Card>
            ))
          : stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index}>
                  <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                    <CardTitle className='text-sm font-medium'>
                      {stat.title}
                    </CardTitle>
                    <div className={`p-2 rounded-full ${stat.bgColor}`}>
                      <Icon className={`h-4 w-4 ${stat.color}`} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className='text-2xl md:text-3xl font-bold'>
                      {stat.value}
                    </div>
                    <p className='text-xs text-muted-foreground'>
                      {stat.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
      </div>

      <div className='grid gap-4 grid-cols-1 lg:grid-cols-7'>
        {/* Sales Chart */}
        <Card className='lg:col-span-4'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <TrendingUp className='h-5 w-5' />
              Monthly Sales Overview
            </CardTitle>
            <CardDescription>
              Sales performance for {currentYear}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {dashboardStatisticsIsLoading ? (
              <Skeleton className='h-[350px] w-full' />
            ) : (
              <ChartContainer
                config={chartConfig}
                className='min-h-[300px] h-[350px] w-full'
              >
                <BarChart
                  data={dashboardStatistics?.monthlyData || []}
                  margin={{ top: 20, right: 10, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray='3 3' vertical={false} />
                  <XAxis
                    dataKey='month'
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    fontSize={12}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value) => `AU$${Number(value).toFixed(2)}`}
                      />
                    }
                    cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                  />
                  <Bar dataKey='sales' fill='#FF8804' radius={[8, 8, 0, 0]} />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <Card className='lg:col-span-3'>
          <CardHeader>
            <CardTitle>Year Summary</CardTitle>
            <CardDescription>{currentYear} Statistics</CardDescription>
          </CardHeader>
          <CardContent className='space-y-6'>
            {dashboardStatisticsIsLoading ? (
              <>
                <Skeleton className='h-20 w-full' />
                <Skeleton className='h-20 w-full' />
                <Skeleton className='h-20 w-full' />
              </>
            ) : (
              <>
                <div className='space-y-2'>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm font-medium text-muted-foreground'>
                      Total Sales
                    </span>
                    <span className='text-xl md:text-2xl font-bold text-green-600'>
                      AU${dashboardStatistics?.totalSales?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                  <div className='h-2 bg-gray-100 rounded-full overflow-hidden'>
                    <div
                      className='h-full bg-green-500'
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>

                <div className='space-y-2'>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm font-medium text-muted-foreground'>
                      Total Orders
                    </span>
                    <span className='text-xl md:text-2xl font-bold text-blue-600'>
                      {dashboardStatistics?.totalOrders || 0}
                    </span>
                  </div>
                  <div className='h-2 bg-gray-100 rounded-full overflow-hidden'>
                    <div
                      className='h-full bg-blue-500'
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>

                <div className='space-y-2'>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm font-medium text-muted-foreground'>
                      Average Order Value
                    </span>
                    <span className='text-xl md:text-2xl font-bold text-purple-600'>
                      AU$
                      {dashboardStatistics?.totalOrders
                        ? (
                            (dashboardStatistics?.totalSales || 0) /
                            dashboardStatistics.totalOrders
                          ).toFixed(2)
                        : '0.00'}
                    </span>
                  </div>
                  <div className='h-2 bg-gray-100 rounded-full overflow-hidden'>
                    <div
                      className='h-full bg-purple-500'
                      style={{ width: '75%' }}
                    />
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>
            Latest {dashboardRecentOrders?.count || 0} orders from your store
          </CardDescription>
        </CardHeader>
        <CardContent>
          {dashboardRecentOrdersIsLoading ? (
            <div className='space-y-2'>
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className='h-16 w-full' />
              ))}
            </div>
          ) : (
            <div className='rounded-md border'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead className='text-right'>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dashboardRecentOrders?.orders?.length ? (
                    dashboardRecentOrders.orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className='font-medium'>
                          {order.orderId}
                        </TableCell>
                        <TableCell>{order.email}</TableCell>
                        <TableCell>
                          {format(new Date(order.createdAt), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant='secondary'
                            className={getStatusColor(order.status)}
                          >
                            {orderStatusConvert[order.status]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant='secondary'
                            className={getPaymentStatusColor(
                              order.paymentStatus
                            )}
                          >
                            {paymentStatusConvert[order.paymentStatus]}
                          </Badge>
                        </TableCell>
                        <TableCell className='text-right font-medium'>
                          AU${order.total.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className='h-24 text-center text-muted-foreground'
                      >
                        No orders found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
