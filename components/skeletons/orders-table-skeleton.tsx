import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export function OrdersTableSkeleton() {
  return (
    <div className='rounded-md border'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <Skeleton className='h-4 w-24' />
            </TableHead>
            <TableHead>
              <Skeleton className='h-4 w-32' />
            </TableHead>
            <TableHead>
              <Skeleton className='h-4 w-20' />
            </TableHead>
            <TableHead>
              <Skeleton className='h-4 w-20' />
            </TableHead>
            <TableHead>
              <Skeleton className='h-4 w-20' />
            </TableHead>
            <TableHead>
              <Skeleton className='h-4 w-20' />
            </TableHead>
            <TableHead>
              <Skeleton className='h-4 w-24' />
            </TableHead>
            <TableHead className='text-center'>
              <Skeleton className='h-4 w-16 mx-auto' />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 10 }).map((_, index) => (
            <TableRow key={index}>
              <TableCell>
                <Skeleton className='h-4 w-28' />
              </TableCell>
              <TableCell>
                <Skeleton className='h-4 w-40' />
              </TableCell>
              <TableCell>
                <Skeleton className='h-6 w-20' />
              </TableCell>
              <TableCell>
                <Skeleton className='h-6 w-20' />
              </TableCell>
              <TableCell>
                <Skeleton className='h-6 w-20' />
              </TableCell>
              <TableCell>
                <Skeleton className='h-4 w-20' />
              </TableCell>
              <TableCell>
                <Skeleton className='h-4 w-24' />
              </TableCell>
              <TableCell className='text-center'>
                <Skeleton className='h-8 w-8 mx-auto' />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
