import { HeroSection } from "@/components/sections/HeroSection";
import { FeatureSection } from "@/components/sections/FeatureSection";
import { HowItWorksSection } from "@/components/sections/HowItWorksSection";
import { CtaSection } from "@/components/sections/CtaSection";
import NavBar  from "@/components/common/NavBar"; // NavBar 컴포넌트 임포트

export default function Home() {
  return (
    <div className="flex flex-col">
      <NavBar /> {/* NavBar를 가장 위에 렌더링 */}
      <HeroSection />
      <FeatureSection />
      <HowItWorksSection />
      <CtaSection />
    </div>
  );
}