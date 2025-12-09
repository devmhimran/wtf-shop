'use client';
import React from 'react';
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  MotionValue,
} from 'framer-motion';

export const products = [
  {
    title: 'What the funk T shirt 01',
    link: '/new-drops',
    thumbnail: '/assets/parallax-images/what-the-funk-1.jpg',
  },
  {
    title: 'What the funk T shirt 02',
    link: '/new-drops',
    thumbnail: '/assets/parallax-images/what-the-funk-2.jpg',
  },
  {
    title: 'What the funk T shirt 03',
    link: '/new-drops',
    thumbnail: '/assets/parallax-images/what-the-funk-3.jpg',
  },

  {
    title: 'What the funk T shirt 04',
    link: '/new-drops',
    thumbnail: '/assets/parallax-images/what-the-funk-4.jpg',
  },
  {
    title: 'What the funk T shirt 05',
    link: '/new-drops',
    thumbnail: '/assets/parallax-images/what-the-funk-5.jpg',
  },
  {
    title: 'What the funk T shirt 06',
    link: '/new-drops',
    thumbnail: '/assets/parallax-images/what-the-funk-6.jpg',
  },

  {
    title: 'What the funk T shirt 07',
    link: '/new-drops',
    thumbnail: '/assets/parallax-images/what-the-funk-7.jpg',
  },
  {
    title: 'What the funk T shirt 08',
    link: '/new-drops',
    thumbnail: '/assets/parallax-images/what-the-funk-8.jpg',
  },
  {
    title: 'What the funk T shirt 09',
    link: '/new-drops',
    thumbnail: '/assets/parallax-images/what-the-funk-9.jpg',
  },
  {
    title: 'What the funk T shirt 10',
    link: '/new-drops',
    thumbnail: '/assets/parallax-images/what-the-funk-10.jpg',
  },
  {
    title: 'What the funk T shirt 11',
    link: '/new-drops',
    thumbnail: '/assets/parallax-images/what-the-funk-11.jpg',
  },

  {
    title: 'What the funk T shirt 12',
    link: '/new-drops',
    thumbnail: '/assets/parallax-images/what-the-funk-12.jpg',
  },
  {
    title: 'What the funk T shirt 13',
    link: '/new-drops',
    thumbnail: '/assets/parallax-images/what-the-funk-13.jpg',
  },
];

export const HeroParallax = () => {
  const firstRow = products.slice(0, 5);
  const secondRow = products.slice(5, 10);
  const thirdRow = products.slice(10, 15);
  const ref = React.useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });

  const springConfig = { stiffness: 300, damping: 30, bounce: 100 };

  const translateX = useSpring(
    useTransform(scrollYProgress, [0, 1], [0, 1000]),
    springConfig
  );
  const translateXReverse = useSpring(
    useTransform(scrollYProgress, [0, 1], [0, -1000]),
    springConfig
  );
  const rotateX = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [15, 0]),
    springConfig
  );
  const opacity = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [0.2, 1]),
    springConfig
  );
  const rotateZ = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [20, 0]),
    springConfig
  );
  const translateY = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [-700, 500]),
    springConfig
  );
  return (
    <div
      ref={ref}
      className='h-[300vh] py-40 overflow-hidden  antialiased relative flex flex-col self-auto [perspective:1000px] [transform-style:preserve-3d]'
    >
      <Header />
      <motion.div
        style={{
          rotateX,
          rotateZ,
          translateY,
          opacity,
        }}
        className=''
      >
        <motion.div className='flex flex-row-reverse space-x-reverse space-x-20 mb-20'>
          {firstRow.map((product) => (
            <ProductCard
              product={product}
              translate={translateX}
              key={product.title}
            />
          ))}
        </motion.div>
        <motion.div className='flex flex-row  mb-20 space-x-20 '>
          {secondRow.map((product) => (
            <ProductCard
              product={product}
              translate={translateXReverse}
              key={product.title}
            />
          ))}
        </motion.div>
        <motion.div className='flex flex-row-reverse space-x-reverse space-x-20'>
          {thirdRow.map((product) => (
            <ProductCard
              product={product}
              translate={translateX}
              key={product.title}
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

export const Header = () => {
  return (
    <div className='max-w-7xl relative mx-auto py-20 md:py-40 px-4 w-full left-0 top-0'>
      <h1 className='text-2xl md:text-7xl font-bold dark:text-white'>
        Elevate Your Style <br /> with Our Exclusive T-Shirts
      </h1>
      <p className='max-w-2xl text-base md:text-xl mt-8 dark:text-neutral-200'>
        Explore our range of high-quality T-Shirts made from the finest
        materials. Whether you seek a casual look or a more sophisticated style,
        we have the ideal T-Shirt for any occasion. Shop now to enjoy
        unparalleled comfort and exceptional quality.
      </p>
    </div>
  );
};

export const ProductCard = ({
  product,
  translate,
}: {
  product: {
    title: string;
    link: string;
    thumbnail: string;
  };
  translate: MotionValue<number>;
}) => {
  return (
    <motion.div
      style={{
        x: translate,
      }}
      key={product.title}
      className='group/product h-96 w-[30rem] relative flex-shrink-0'
    >
      <div className='block  '>
        <img
          src={product.thumbnail}
          height='600'
          width='700'
          className='object-cover object-left-top absolute h-full w-full inset-0'
          alt={product.title || 'what the funk thumbnail'}
        />
      </div>
      <div className='absolute inset-0 h-full w-full opacity-0 bg-black pointer-events-none'></div>
      <h2 className='absolute bottom-4 left-4 opacity-0 group-hover/product:opacity-100 text-white'>
        {product.title}
      </h2>
    </motion.div>
  );
};
