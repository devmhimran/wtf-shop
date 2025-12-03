'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MediaType } from '@/types';
import { ProductFeaturedImageChoose } from './product-feature-image-choose';
import { CreateMediaForm } from '@/components/forms';
import { useState } from 'react';

type ProductFeaturedImageProps = {
  image: MediaType | null;
  setImage: (image: MediaType | null) => void;
  setIsOpen: (open: boolean) => void;
};
export function ProductFeaturedImage({
  image,
  setImage,
  setIsOpen,
}: ProductFeaturedImageProps) {
  const [activeTab, setActiveTab] = useState('choose');

  const handleUploadSuccess = () => {
    setActiveTab('choose');
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
      <TabsList className='w-full'>
        <TabsTrigger value='upload'>Upload</TabsTrigger>
        <TabsTrigger value='choose'>Choose</TabsTrigger>
      </TabsList>
      <TabsContent value='upload'>
        <CreateMediaForm setIsOpen={handleUploadSuccess} />
      </TabsContent>
      <TabsContent value='choose'>
        <ProductFeaturedImageChoose
          image={image}
          setImage={setImage}
          setIsOpen={setIsOpen}
        />
      </TabsContent>
    </Tabs>
  );
}
