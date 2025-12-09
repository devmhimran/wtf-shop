'use client';

import { cn } from '@/lib/utils';
import { PublicCategoryType } from '@/types';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';

import Link from 'next/link';
import { useRef, useState } from 'react';

type CategoriesCardProps = {
  category: PublicCategoryType;
};

export function PublicCategoriesCard({ category }: CategoriesCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  const [direction, setDirection] = useState<
    'top' | 'bottom' | 'left' | 'right' | string
  >('left');

  const handleMouseEnter = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    if (!ref.current) return;

    const direction = getDirection(event, ref.current);
    switch (direction) {
      case 0:
        setDirection('top');
        break;
      case 1:
        setDirection('right');
        break;
      case 2:
        setDirection('bottom');
        break;
      case 3:
        setDirection('left');
        break;
      default:
        setDirection('left');
        break;
    }
  };

  const getDirection = (
    ev: React.MouseEvent<HTMLDivElement, MouseEvent>,
    obj: HTMLElement
  ) => {
    const { width: w, height: h, left, top } = obj.getBoundingClientRect();
    const x = ev.clientX - left - (w / 2) * (w > h ? h / w : 1);
    const y = ev.clientY - top - (h / 2) * (h > w ? w / h : 1);
    const d = Math.round(Math.atan2(y, x) / 1.57079633 + 5) % 4;
    return d;
  };

  return (
    <motion.div
      onMouseEnter={handleMouseEnter}
      ref={ref}
      className={cn(' bg-black/20 overflow-hidden group/card relative')}
    >
      <AnimatePresence mode='wait'>
        <motion.div
          initial='initial'
          whileHover={direction}
          exit='exit'
          className='w-full h-full bg-black/20 aspect-[3/4.5] flex flex-col gap-2.5 group relative transition-all duration-500'
        >
          <motion.div className='group-hover/card:block  absolute inset-0 w-full h-full bg-black/20 z-10 transition duration-500' />
          <motion.div className='group-hover/card:block hidden absolute inset-0 w-full h-full bg-black/20 z-10 transition duration-500' />
          <motion.div
            variants={variants}
            className='h-full w-full relative  bg-black/20'
            transition={{
              duration: 0.2,
              ease: 'easeOut',
            }}
          >
            <Image
              className={cn('h-full w-full object-cover scale-[1.15]')}
              src={
                category.image?.fileUrl || '/assets/img/placeholder-image.png'
              }
              width={470}
              height={575}
              decoding='async'
              loading='lazy'
              alt={category.name || category.image?.alt || 'Category Image'}
            />
          </motion.div>
          <motion.div
            variants={textVariants}
            transition={{
              duration: 0.5,
              ease: 'easeOut',
            }}
            className={cn(
              'text-white absolute inset-0 z-40  grid place-content-center p-2'
            )}
          >
            <h3 className='text-4xl text-white font-medium text-center'>
              {category.name}
            </h3>
            <Link
              href={`/new-drops?page=1&category=${category.slug}`}
              className='uppercase text-base font-medium text-center text-black bg-white px-6 py-2 rounded-lg mt-2 w-fit mx-auto'
            >
              Shop now
            </Link>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

const variants = {
  initial: {
    x: 0,
  },

  exit: {
    x: 0,
    y: 0,
  },
  top: {
    y: 20,
  },
  bottom: {
    y: -20,
  },
  left: {
    x: 20,
  },
  right: {
    x: -20,
  },
};

const textVariants = {
  initial: {
    y: 0,
    x: 0,
    opacity: 1,
  },
  exit: {
    y: 0,
    x: 0,
    opacity: 1,
  },
  top: {
    y: -20,
    opacity: 1,
  },
  bottom: {
    y: 2,
    opacity: 1,
  },
  left: {
    x: -2,
    opacity: 1,
  },
  right: {
    x: 20,
    opacity: 1,
  },
};
