import { Header } from '@/components/ecommerce/Header';
import { Hero } from '@/components/ecommerce/Hero';
import { ProductGrid } from '@/components/ecommerce/ProductGrid';
import { Footer } from '@/components/ecommerce/Footer';
import { Separator } from '@/components/ui/separator';

const Index = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <Hero />
      <div className="container mx-auto px-4 pt-10 md:pt-12">
        <Separator />
      </div>
      <main id="products" className="container mx-auto flex-1 scroll-mt-24 px-4 pb-10 pt-10 md:pb-12 md:pt-12">
        <ProductGrid />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
