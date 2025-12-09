import {
  AllCategories,
  HeroParallax,
  HeroSlider,
} from '@/components/public-pages/home';

export default function PublicHomePage() {
  return (
    <div>
      <HeroSlider />
      <AllCategories />
      <HeroParallax />
    </div>
  );
}
