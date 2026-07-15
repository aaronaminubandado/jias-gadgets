import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useRef,
  useCallback,
  ReactNode,
} from 'react';
import { Product, CartItem, Cart } from '@/types/product';
import {
  computeCartTotals,
  emptyCart,
  loadCartFromStorage,
  saveCartToStorage,
  clearCartStorage,
} from '@/lib/cartStorage';

interface CartContextType {
  cart: Cart;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

type CartAction =
  | { type: 'ADD_TO_CART'; payload: Product }
  | { type: 'REMOVE_FROM_CART'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'HYDRATE'; payload: Cart };

function cartReducer(state: Cart, action: CartAction): Cart {
  switch (action.type) {
    case 'HYDRATE':
      return action.payload;

    case 'ADD_TO_CART': {
      const existingItem = state.items.find(
        (item) => item.product.id === action.payload.id
      );

      if (existingItem) {
        const updatedItems = state.items.map((item) =>
          item.product.id === action.payload.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
        return { items: updatedItems, ...computeCartTotals(updatedItems) };
      }

      const newItems = [
        ...state.items,
        { product: action.payload, quantity: 1 },
      ];
      return { items: newItems, ...computeCartTotals(newItems) };
    }

    case 'REMOVE_FROM_CART': {
      const filteredItems = state.items.filter(
        (item) => item.product.id !== action.payload
      );
      return { items: filteredItems, ...computeCartTotals(filteredItems) };
    }

    case 'UPDATE_QUANTITY': {
      if (action.payload.quantity <= 0) {
        return cartReducer(state, {
          type: 'REMOVE_FROM_CART',
          payload: action.payload.id,
        });
      }

      const updatedItems = state.items.map((item) =>
        item.product.id === action.payload.id
          ? { ...item, quantity: action.payload.quantity }
          : item
      );
      return { items: updatedItems, ...computeCartTotals(updatedItems) };
    }

    case 'CLEAR_CART':
      return emptyCart;

    default:
      return state;
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, dispatch] = useReducer(
    cartReducer,
    emptyCart,
    () => loadCartFromStorage()
  );
  const hasHydrated = useRef(false);

  useEffect(() => {
    hasHydrated.current = true;
  }, []);

  useEffect(() => {
    if (!hasHydrated.current) return;
    saveCartToStorage(cart);
  }, [cart]);

  const addToCart = useCallback((product: Product) => {
    dispatch({ type: 'ADD_TO_CART', payload: product });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: productId });
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id: productId, quantity } });
  }, []);

  const clearCart = useCallback(() => {
    clearCartStorage();
    dispatch({ type: 'CLEAR_CART' });
  }, []);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
