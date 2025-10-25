import { 
  HeroSection, 
  ResearchList, 
  FeaturesSection, 
  NewsletterSection 
} from '../components/sections';
import {
  heroContent,
  heroStats,
  researchArticles,
  features,
} from '../data/demoData';

export function LandingPage() {
  return (
    <>
      <HeroSection content={heroContent} stats={heroStats} />
      <ResearchList articles={researchArticles} />
      <FeaturesSection features={features} />
      <NewsletterSection />
    </>
  );
}
