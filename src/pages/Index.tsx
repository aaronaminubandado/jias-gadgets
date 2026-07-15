import { Header } from '@/components/ecommerce/Header';
import { Hero } from '@/components/ecommerce/Hero';
import { ProductGrid } from '@/components/ecommerce/ProductGrid';
import { StoreLayout } from '@/components/ecommerce/StoreLayout';
import { Separator } from '@/components/ui/separator';

const Index = () => {
  return (
    <StoreLayout mainClassName="flex flex-col">
      <Hero />
      <div className="container mx-auto px-4 pt-10 md:pt-12">
        <Separator />
      </div>
      <div id="products" className="container mx-auto flex-1 scroll-mt-24 px-4 pb-10 pt-10 md:pb-12 md:pt-12">
        <ProductGrid />
      </div>
    </StoreLayout>
  );
};

export default Index;
