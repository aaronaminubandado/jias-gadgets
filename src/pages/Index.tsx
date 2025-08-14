import { Header } from '@/components/ecommerce/Header';
import { ProductGrid } from '@/components/ecommerce/ProductGrid';
import { CartProvider } from '@/hooks/useCart';

const Index = () => {
  return (
    <CartProvider>
      <div className="min-h-screen bg-gradient-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <ProductGrid />
        </main>
      </div>
    </CartProvider>
  );
};

export default Index;
