import { X, Plus, Minus, ShoppingBag, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/hooks/useCart';
import { useState } from 'react';
import { CheckoutModal } from './CheckoutModal';

interface CartSidebarProps {
  children: React.ReactNode;
}

export function CartSidebar({ children }: CartSidebarProps) {
  const { cart, removeFromCart, updateQuantity } = useCart();
  const [showCheckout, setShowCheckout] = useState(false);

  return (
    <>
      <Sheet>
        <SheetTrigger asChild>
          <div className="relative">
            {children}
            {cart.itemCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs"
              >
                {cart.itemCount}
              </Badge>
            )}
          </div>
        </SheetTrigger>
        <SheetContent className="flex h-full w-full flex-col overflow-hidden sm:max-w-lg bg-sidebar border-sidebar-border">
          <SheetHeader className="shrink-0">
            <SheetTitle className="flex items-center gap-2 text-sidebar-foreground">
              <ShoppingBag className="w-5 h-5" />
              Shopping Cart ({cart.itemCount} items)
            </SheetTitle>
          </SheetHeader>
          
          <div className="mt-6 flex min-h-0 flex-1 flex-col">
            {cart.items.length === 0 ? (
              <div className="flex flex-col items-center justify-center flex-1 text-center">
                <ShoppingBag className="w-16 h-16 text-muted-foreground mb-4" />
                <p className="text-lg font-medium text-sidebar-foreground mb-2">Your cart is empty</p>
                <p className="text-muted-foreground">Add some products to get started!</p>
              </div>
            ) : (
              <>
                <div className="min-h-0 flex-1 space-y-4 overflow-y-auto">
                  {cart.items.map((item) => (
                    <div key={item.product.id} className="flex gap-4 p-4 bg-card rounded-lg border border-card-border">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded-md"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-card-foreground line-clamp-1">
                          {item.product.name}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          ${item.product.price} each
                        </p>
                        
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                              className="h-7 w-7 p-0"
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="text-sm font-medium w-8 text-center">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              className="h-7 w-7 p-0"
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromCart(item.product.id)}
                            className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                        
                        <p className="text-sm font-medium text-primary mt-1">
                          Total: ${(item.product.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="shrink-0 space-y-4 border-t border-sidebar-border pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-sidebar-foreground">Total:</span>
                    <span className="text-xl font-bold text-primary">${cart.total.toFixed(2)}</span>
                  </div>
                  
                  <Button 
                    className="w-full gap-2"
                    onClick={() => setShowCheckout(true)}
                  >
                    <CreditCard className="w-4 h-4" />
                    Proceed to Checkout
                  </Button>
                </div>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>
      
      <CheckoutModal 
        open={showCheckout} 
        onOpenChange={setShowCheckout}
        cart={cart}
      />
    </>
  );
}