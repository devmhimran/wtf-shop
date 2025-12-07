'use client';

import { useState, useEffect, useRef } from 'react';
import Autoplay from 'embla-carousel-autoplay';

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel';
import { motion, useScroll, useTransform } from 'framer-motion';

import { Highlight } from '@/components/shared/hero-highlight';

const images = [
  {
    id: 1,
    src: '/assets/img/what-the-funk-hero-image-01.jpg',
  },
  {
    id: 2,
    src: '/assets/img/what-the-funk-hero-image-02.jpg',
  },
  {
    id: 3,
    src: '/assets/img/what-the-funk-hero-image-03.jpg',
  },
  {
    id: 4,
    src: '/assets/img/what-the-funk-hero-image-04.jpg',
  },
  {
    id: 5,
    src: '/assets/img/what-the-funk-hero-image-05.jpg',
  },
];

export function HeroSlider() {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  // const {
  //   data: categoriesWithCustom,
  //   isLoading: isLoadingCategoryWithCustom,
  // }: { data: any; isLoading: boolean } = useQuery({
  //   queryKey: ['categoriesWithCustom'],
  //   queryFn: () => categoryApi.withCustom().then(({ data }) => data),
  // });

  useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on('select', () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  const y = useTransform(scrollYProgress, [0, 1], ['50%', '10%']);

  // Find the first custom t-shirt category slug
  // const customTShirtCategory = categoriesWithCustom?.data?.find(
  //   (cat: any) =>
  //     cat.attributes.category_slug &&
  //     cat.attributes.category_slug.toLowerCase().includes('custom') &&
  //     cat.attributes.category_slug.toLowerCase().includes('t-shirt')
  // );

  return (
    <>
      <Carousel
        plugins={[
          Autoplay({
            delay: 3500,
          }),
        ]}
        setApi={setApi}
        className='w-full relative'
      >
        <CarouselContent>
          {images.map((item, index) => (
            <CarouselItem key={index}>
              <div className='flex w-full h-screen'>
                <img
                  src={item.src}
                  width={1400}
                  height={400}
                  decoding='async'
                  loading='lazy'
                  alt={`${index}`}
                  className='w-full h-full object-cover object-center aspect-auto'
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className='absolute inset-0 bg-black opacity-50'></div>
        {/* Centered overlay */}
        <div className='absolute inset-0 flex flex-col items-center justify-center px-4'>
          <motion.h1
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: [20, -5, 0],
            }}
            transition={{
              duration: 0.5,
              ease: [0.4, 0.0, 0.2, 1],
            }}
            style={{
              top: y,
            }}
            ref={sectionRef}
            className='text-2xl md:text-4xl lg:text-5xl font-bold text-white dark:text-white max-w-4xl leading-relaxed lg:leading-snug text-center mx-auto'
          >
            Custom{' '}
            <Highlight className='text-black dark:text-white'>
              T-Shirts
            </Highlight>
          </motion.h1>
          <motion.p
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: [20, -5, 0],
            }}
            transition={{
              duration: 0.5,
              ease: [0.4, 0.0, 0.2, 1],
            }}
            className='text-base md:text-xl lg:text-2xl text-white dark:text-neutral-300 mt-6 max-w-3xl leading-relaxed lg:leading-snug text-center mx-auto'
          >
            We specialize in designing custom T-shirts, Jackets, Hats and more..
            Great for businesses, sports teams, promotional events, and special
            occasions. Get in touch with us to craft something unique.
          </motion.p>
          {/* <div className='flex justify-center'>
            <Link
              href={
                customTShirtCategory
                  ? `/collections/new-drops?page=1&filter=${customTShirtCategory.attributes.category_slug}`
                  : `/collections/new-drops?page=1&filter=custom-t-shirt`
              }
              className='uppercase text-lg md:text-2xl font-medium text-center text-black bg-white px-5 py-2 rounded-lg mt-6'
            >
              Shop now
            </Link>
          </div> */}
        </div>
      </Carousel>

      {/* <div className="py-2 text-center text-sm text-muted-foreground">
        Slide {current} of {count}
      </div> */}
    </>
  );
}
