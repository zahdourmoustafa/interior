import Header from "@/components/landing/header";
import HeroSection from "@/components/landing/hero-section";

import ToolsSection from "@/components/landing/tools-section";
import GalleryCarousel from "@/components/landing/gallery-carousel";
import SolutionSection from "@/components/landing/solution-section";
import HowItWorksSection from "@/components/landing/how-it-works-section";
import FeaturesSection from "@/components/landing/features-section";
import PricingSection from "@/components/landing/pricing-section";
import CTASection from "@/components/landing/cta-section";
import Footer from "@/components/landing/footer";

export default function Home() {
  return (
    <main>
      <Header />
      <HeroSection />
      <ToolsSection />
      <GalleryCarousel />
      <SolutionSection />
      <HowItWorksSection />
      <FeaturesSection />
      <PricingSection />
      <CTASection />
      <Footer />
    </main>
  );
}
