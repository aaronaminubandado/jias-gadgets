import { ShoppingCart, Image as ImageIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/types/product';
import { useCart } from '@/hooks/useCart';
import { toast } from '@/hooks/use-toast';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    if (!product.inStock) {
      toast({
        title: "Out of Stock",
        description: "This item is currently unavailable.",
        variant: "destructive",
      });
      return;
    }
    
    addToCart(product);
    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  return (
    <Card className="product-card group border-card-border bg-card hover:shadow-lg transition-all duration-normal">
      <CardContent className="p-0">
        <div className="relative overflow-hidden rounded-t-md">
          <Link to={`/product/${product.id}`} className="block aspect-[2/1] w-full overflow-hidden bg-muted">
            {product.image && product.image !== '/placeholder.svg' ? (
              <img
                src={product.image}
                alt={product.name}
                className="h-full w-full object-cover transition-transform duration-normal group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <ImageIcon className="h-7 w-7 text-muted-foreground/60" />
              </div>
            )}
          </Link>
          {!product.inStock && (
            <Badge 
              variant="destructive" 
              className="absolute top-3 left-3"
            >
              Out of Stock
            </Badge>
          )}
          <Badge 
            variant="secondary" 
            className="absolute top-3 right-3 bg-background/80 backdrop-blur-sm"
          >
            {product.category}
          </Badge>
        </div>
        
        <div className="p-6">
          <h3 className="mb-2 font-display text-lg font-semibold text-card-foreground line-clamp-1">
            <Link
              to={`/product/${product.id}`}
              className="hover:text-primary transition-colors"
            >
              {product.name}
            </Link>
          </h3>
          
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {product.description}
          </p>
          
          <div className="flex items-center justify-between">
            <div>
              <span className="font-mono text-2xl font-bold text-primary">
                ${product.price.toFixed(2)}
              </span>
              {product.inStock && product.stock <= 5 && (
                <p className="text-xs font-medium text-accent">
                  Only {product.stock} left
                </p>
              )}
            </div>
            <Button 
              onClick={handleAddToCart}
              disabled={!product.inStock}
              className="gap-2 bg-gradient-primary hover:opacity-90 transition-opacity"
            >
              <ShoppingCart className="w-4 h-4" />
              Add to Cart
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}