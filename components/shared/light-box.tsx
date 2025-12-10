'use client';

import Lightbox from 'react-spring-lightbox';
import { cn } from '@/lib/utils';
import { ChevronLeftIcon, ChevronRightIcon, X } from 'lucide-react';

type LightBoxProps = {
  isOpen: boolean;
  close: () => void;
  images: { src: string; alt: string }[];
  currentImageIndex: number;
  setCurrentImageIndex: (index: number) => void;
};

export function LightBox({
  isOpen,
  close,
  images,
  currentImageIndex,
  setCurrentImageIndex,
}: LightBoxProps) {
  function gotoPrevious() {
    currentImageIndex > 0 && setCurrentImageIndex(currentImageIndex - 1);
  }

  function gotoNext() {
    currentImageIndex + 1 < images.length &&
      setCurrentImageIndex(currentImageIndex + 1);
  }

  return (
    <Lightbox
      isOpen={isOpen}
      onPrev={gotoPrevious}
      onNext={gotoNext}
      images={images}
      onClose={close}
      currentIndex={currentImageIndex}
      className='backdrop-blur'
      renderHeader={() => (
        <button
          onClick={close}
          className='fixed z-10 grid w-8 h-8 ml-4 transition-transform bg-gray-700 shadow place-items-center top-4 right-4 hover:rotate-180'
        >
          <X className='w-5 h-5 text-white' />
        </button>
      )}
      renderPrevButton={() => (
        <button
          onClick={gotoPrevious}
          className={cn(
            'z-10 w-10 h-10 p-2 ml-4 bg-gray-700 shadow shrink-0 hover:bg-gray-800',
            currentImageIndex < 1 && 'hidden'
          )}
        >
          <ChevronLeftIcon className='text-white' />
        </button>
      )}
      renderNextButton={() => (
        <button
          onClick={gotoNext}
          className={cn(
            'z-10 w-10 h-10 p-2 mr-4 bg-gray-700 shadow shrink-0 hover:bg-gray-800',
            currentImageIndex === images.length - 1 && 'hidden'
          )}
        >
          <ChevronRightIcon className='text-white' />
        </button>
      )}
      pageTransitionConfig={{
        from: {
          opacity: 0,
          background: '#0000',
        },
        enter: { opacity: 1, background: '#0008' },
        leave: { opacity: 0, background: '#0000' },
        config: { mass: 1, tension: 320, friction: 32 },
      }}
    />
  );
}
