import CTA from "./components/landing/CTA";
import { Hero2 } from "./components/landing/Hero2";
import { ProductShowcase } from "./components/landing/ProductShowcase";
import { Testimonials } from "./components/landing/Testimonials";
export default function Page() {
  return (
    <div className="w-full">
      <Hero2 />
      <ProductShowcase />
      <Testimonials />
      <CTA />
    </div>
  );
}
