import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { CartProvider } from "@/hooks/useCart";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ManageDashboard from "./pages/ManageDashboard";
import Orders from "./pages/Orders";
import ProductDetail from "./pages/ProductDetail";
import Success from "./pages/Success";
import Cancel from "./pages/Cancel";
import NotFound from "./pages/NotFound";
import { ProtectedRoute } from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
	<QueryClientProvider client={queryClient}>
		<AuthProvider>
			<CartProvider>
				<TooltipProvider>
					<Toaster />
					<Sonner />
					<BrowserRouter>
						<Routes>
							<Route path="/" element={<Index />} />
							<Route path="/login" element={<Login />} />
							<Route path="/register" element={<Register />} />
							<Route path="/orders" element={<Orders />} />
							<Route path="/product/:id" element={<ProductDetail />} />
							<Route path="/success" element={<Success />} />
							<Route path="/cancel" element={<Cancel />} />
							<Route
								path="/manage"
								element={
									<ProtectedRoute requiredRoles={["store", "admin"]}>
										<ManageDashboard />
									</ProtectedRoute>
								}
							/>
							{/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
							<Route path="*" element={<NotFound />} />
						</Routes>
					</BrowserRouter>
				</TooltipProvider>
			</CartProvider>
		</AuthProvider>
	</QueryClientProvider>
);

export default App;
