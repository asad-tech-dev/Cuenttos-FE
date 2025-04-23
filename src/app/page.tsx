import CTA from "./components/landing/CTA";
import  Hero  from "./components/landing/Hero";
import { ProductShowcase } from "./components/landing/ProductShowcase";
import { Testimonials } from "./components/landing/Testimonials";
import Bentodemo from "./components/landing/Feartures";
import Explain from "./components/landing/Explain";
import Footer from "./components/landing/Footer";
export default function Page() {
  return (
    <div className="w-full">
      <Hero />
      <Explain />
      <ProductShowcase />
      <Bentodemo />
      <Testimonials />
      <CTA />
      <Footer />
    </div>
  );
}
