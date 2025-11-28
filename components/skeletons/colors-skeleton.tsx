import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export function ColorsSkeleton() {
  return (
    <div className='rounded-md border'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className='w-80px'>Serial</TableHead>
            <TableHead>Name</TableHead>
            <TableHead className='text-end'>Options</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, index) => (
            <TableRow key={index}>
              <TableCell>
                <Skeleton className='h-5 w-8' />
              </TableCell>
              <TableCell>
                <Skeleton className='h-5 w-32' />
              </TableCell>
              <TableCell className='text-end'>
                <Skeleton className='h-5 w-5 ml-auto' />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
