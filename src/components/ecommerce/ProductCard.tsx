import { Star, ShoppingCart } from 'lucide-react';
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
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-64 object-cover transition-transform duration-normal group-hover:scale-105"
          />
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
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-card-foreground line-clamp-1">
              {product.name}
            </h3>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-accent text-accent" />
              <span className="text-sm text-muted-foreground">{product.rating}</span>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {product.description}
          </p>
          
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-primary">
              ${product.price}
            </span>
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