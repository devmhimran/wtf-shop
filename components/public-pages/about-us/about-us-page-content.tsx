'use client';

import { singularPagesApi } from '@/lib/api-helper/singular-pages-api';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

export function AboutUsPageContent() {
  const { isLoading, data } = useQuery({
    queryKey: ['about-us-page-content'],
    queryFn: async () =>
      await singularPagesApi.public.getAboutUs().then((res) => res.data),
  });

  if (isLoading) {
    return (
      <div className='container mx-auto px-4 py-12 max-w-5xl'>
        <Skeleton className='h-12 w-64 mb-4' />
        <Skeleton className='h-6 w-full mb-2' />
        <Skeleton className='h-6 w-full mb-2' />
        <Skeleton className='h-6 w-3/4 mb-8' />
        <Skeleton className='h-64 w-full' />
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-linear-to-b from-background to-muted/20'>
      {/* Hero Section */}
      <div className='relative overflow-hidden bg-primary/5 border-b'>
        <div className='absolute inset-0 bg-grid-pattern opacity-5'></div>
        <div className='container mx-auto px-4 py-16 md:py-24 relative z-10'>
          <div className='max-w-4xl mx-auto text-center'>
            <h1 className='text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent'>
              {data?.data.title || 'About Us'}
            </h1>
            <p className='text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto'>
              Discover our story, values, and what makes us unique
            </p>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className='container mx-auto px-4 py-12 md:py-16'>
        <div className='max-w-4xl mx-auto'>
          <Card className='shadow-lg border-2'>
            <CardContent className='p-8 md:p-12'>
              {/* Main Content */}
              <div
                className='prose prose-lg dark:prose-invert max-w-none
                  prose-headings:font-bold prose-headings:tracking-tight
                  prose-h2:text-3xl prose-h2:mb-4 prose-h2:mt-8 prose-h2:text-primary
                  prose-h3:text-2xl prose-h3:mb-3 prose-h3:mt-6
                  prose-p:text-foreground/90 prose-p:leading-relaxed prose-p:mb-4
                  prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                  prose-strong:text-foreground prose-strong:font-semibold
                  prose-ul:my-4 prose-li:my-2
                  prose-blockquote:border-l-primary prose-blockquote:bg-muted/50 
                  prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r
                  prose-img:rounded-lg prose-img:shadow-md'
                dangerouslySetInnerHTML={{
                  __html: data?.data.content || '<p>Content coming soon...</p>',
                }}
              />

              {/* Decorative Elements */}
              {data?.data.content && (
                <>
                  <Separator className='my-8' />
                  <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mt-8'>
                    <div className='text-center p-6 rounded-lg bg-linear-to-br from-primary/10 to-primary/5 border'>
                      <div className='text-3xl font-bold text-primary mb-2'>
                        Our Mission
                      </div>
                      <p className='text-sm text-muted-foreground'>
                        Delivering excellence every day
                      </p>
                    </div>
                    <div className='text-center p-6 rounded-lg bg-linear-to-br from-secondary/10 to-secondary/5 border'>
                      <div className='text-3xl font-bold text-secondary-foreground mb-2'>
                        Our Values
                      </div>
                      <p className='text-sm text-muted-foreground'>
                        Integrity, quality, and innovation
                      </p>
                    </div>
                    <div className='text-center p-6 rounded-lg bg-linear-to-br from-accent/10 to-accent/5 border'>
                      <div className='text-3xl font-bold text-accent-foreground mb-2'>
                        Our Vision
                      </div>
                      <p className='text-sm text-muted-foreground'>
                        Leading the future together
                      </p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
