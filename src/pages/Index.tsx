import { Header } from '@/components/ecommerce/Header';
import { Hero } from '@/components/ecommerce/Hero';
import { ProductGrid } from '@/components/ecommerce/ProductGrid';
import { Footer } from '@/components/ecommerce/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-background flex flex-col">
      <Header />
      <Hero />
      <main id="products" className="container mx-auto px-4 py-8 flex-1 scroll-mt-24">
        <ProductGrid />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
