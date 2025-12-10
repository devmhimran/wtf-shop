import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { PublicProductDetailsType } from '@/types';

type ProductDescriptionProps = {
  data: PublicProductDetailsType;
};

export function ProductDescription({ data }: ProductDescriptionProps) {
  return (
    <div className='mt-12 md:mt-20'>
      <Tabs defaultValue='description' className='w-full'>
        <TabsList className='w-full bg-transparent border-b-2 rounded-none p-6'>
          <TabsTrigger
            value='description'
            className='cursor-pointer text-lg p-6 border-b data-[state=active]:border-b-[#ff9500] data-[state=active]:text-[#ff9500] rounded-none data-[state=active]:shadow-none bg-transparent'
          >
            DESCRIPTION
          </TabsTrigger>
          <TabsTrigger
            value='additional_info'
            className='cursor-pointer text-lg p-6 border-b data-[state=active]:border-b-[#ff9500] data-[state=active]:text-[#ff9500] rounded-none data-[state=active]:shadow-none bg-transparent'
          >
            ADDITIONAL INFO
          </TabsTrigger>
        </TabsList>
        <TabsContent value='description'>
          <div
            className={cn('text-gray-500 w-full md:w-8/12 font-light py-4')}
            dangerouslySetInnerHTML={{
              __html: data.shortDescription,
            }}
          />
        </TabsContent>
        <TabsContent value='additional_info'>
          <div
            className={cn('text-gray-500 w-full md:w-8/12 font-light py-4')}
            dangerouslySetInnerHTML={{
              __html: data.additionalDesc,
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
