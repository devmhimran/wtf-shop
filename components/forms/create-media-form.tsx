'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Loader2Icon, Upload, X, FileIcon } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import { useMedia } from '@/hooks';
import { getErrorResponse } from '@/lib/utils';

const formSchema = z.object({
  title: z.string().optional(),
  alt: z.string().optional(),
});

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

export function CreateMediaForm({
  setIsOpen,
}: {
  setIsOpen: (open: boolean) => void;
}) {
  const [isPending, setIsPending] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      alt: '',
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error('File size must be less than 5MB');
        e.target.value = '';
        return;
      }

      setSelectedFile(file);

      // Generate preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setPreviewUrl(null);
      }
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const { createMediaAsync } = useMedia();

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!selectedFile) {
      toast.error('Please select a file');
      return;
    }

    const payload = {
      file: selectedFile,
      title: values.title,
      alt: values.alt,
    };

    setIsPending(true);

    toast.promise(createMediaAsync(payload), {
      loading: 'Uploading file...',
      success: () => {
        setIsOpen(false);
        return 'File uploaded successfully!';
      },
      error: (error) => getErrorResponse(error) || 'Failed to upload file',
    });
  };

  const isImage = selectedFile?.type.startsWith('image/');

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
        {/* File Upload Area */}
        <div>
          <FormLabel>Upload File</FormLabel>
          <div className='mt-2'>
            {!selectedFile ? (
              <label
                htmlFor='file-upload'
                className='flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/80 transition-colors'
              >
                <div className='flex flex-col items-center justify-center pt-5 pb-6'>
                  <Upload className='w-12 h-12 mb-4 text-muted-foreground' />
                  <p className='mb-2 text-sm text-muted-foreground'>
                    <span className='font-semibold'>Click to upload</span> or
                    drag and drop
                  </p>
                  <p className='text-xs text-muted-foreground'>
                    Images, PDFs, Excel, CSV files supported
                  </p>
                  <p className='text-xs text-muted-foreground mt-1 font-medium'>
                    Maximum file size: 5MB
                  </p>
                </div>
                <Input
                  id='file-upload'
                  type='file'
                  className='hidden'
                  onChange={handleFileChange}
                  accept='image/*,.pdf,.xlsx,.xls,.csv'
                />
              </label>
            ) : (
              <div className='relative border-2 rounded-lg p-4 bg-muted'>
                <button
                  type='button'
                  onClick={handleRemoveFile}
                  className='absolute top-2 right-2 p-1 rounded-full bg-destructive text-white hover:bg-destructive/90 z-10 cursor-pointer'
                >
                  <X className='w-4 h-4' onClick={handleRemoveFile} />
                </button>

                {/* File Preview */}
                <div className='flex flex-col items-center gap-4'>
                  {isImage && previewUrl ? (
                    <div className='relative w-full h-48 rounded-lg overflow-hidden'>
                      <Image
                        src={previewUrl}
                        alt='Preview'
                        fill
                        className='object-contain'
                      />
                    </div>
                  ) : (
                    <div className='flex items-center justify-center w-full h-48 bg-background rounded-lg'>
                      <FileIcon className='w-20 h-20 text-muted-foreground' />
                    </div>
                  )}

                  {/* File Details */}
                  <div className='w-full space-y-2 text-sm'>
                    <div className='flex justify-between items-center'>
                      <span className='font-medium text-muted-foreground'>
                        File Name:
                      </span>
                      <span className='font-mono text-xs truncate max-w-[200px]'>
                        {selectedFile.name}
                      </span>
                    </div>
                    <div className='flex justify-between items-center'>
                      <span className='font-medium text-muted-foreground'>
                        File Size:
                      </span>
                      <span>{formatFileSize(selectedFile.size)}</span>
                    </div>
                    <div className='flex justify-between items-center'>
                      <span className='font-medium text-muted-foreground'>
                        File Type:
                      </span>
                      <span className='uppercase text-xs'>
                        {selectedFile.type.split('/')[1] || 'Unknown'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Optional Fields */}
        {selectedFile && (
          <>
            <FormField
              control={form.control}
              name='title'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder='Enter media title' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isImage && (
              <FormField
                control={form.control}
                name='alt'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alt Text (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Enter alt text for image'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </>
        )}

        {/* Upload Button */}
        <Button
          type='submit'
          disabled={isPending || !selectedFile}
          className='w-full'
        >
          {isPending && <Loader2Icon className='animate-spin mr-2' />}
          Upload File
        </Button>
      </form>
    </Form>
  );
}
