import { useEffect, useState } from 'react';
import { ShoppingCart, Search, Store, User, LogOut, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { CartSidebar } from './CartSidebar';
import { useAuth } from '@/hooks/useAuth';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Header() {
	const { isAuthenticated, user, logout } = useAuth();
	const [searchParams, setSearchParams] = useSearchParams();
	const location = useLocation();
	const navigate = useNavigate();
	const [query, setQuery] = useState(searchParams.get('q') ?? '');

	const isHome = location.pathname === '/';

	// Keep the input in sync when the URL changes (e.g. navigating home)
	useEffect(() => {
		setQuery(searchParams.get('q') ?? '');
	}, [searchParams]);

	const handleSearchChange = (value: string) => {
		setQuery(value);
		if (isHome) {
			setSearchParams(
				(params) => {
					if (value.trim()) {
						params.set('q', value);
					} else {
						params.delete('q');
					}
					return params;
				},
				{ replace: true }
			);
		}
	};

	const handleSearchSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!isHome) {
			navigate(`/?q=${encodeURIComponent(query)}`);
		}
	};

	return (
		<header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
			<div className="container mx-auto px-4 py-4">
				<div className="flex items-center justify-between">
					{/* Logo */}
					<Link to="/" className="flex items-center gap-2">
						<div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
							<Store className="w-5 h-5 text-white" />
						</div>
						<h1 className="text-xl font-bold text-foreground">Jia's Gadgets</h1>
					</Link>

					{/* Search Bar */}
					<form
						onSubmit={handleSearchSubmit}
						className="hidden md:flex items-center flex-1 max-w-md mx-8"
					>
						<div className="relative w-full">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
							<Input
								placeholder="Search products..."
								className="pl-10 bg-muted/50 border-muted"
								aria-label="Search products"
								value={query}
								onChange={(e) => handleSearchChange(e.target.value)}
							/>
						</div>
					</form>

					{/* Actions */}
					<div className="flex items-center gap-2">
					{isAuthenticated ? (
						<>
							{(user?.role === 'store' || user?.role === 'admin') && (
								<Link to="/manage">
									<Button 
										variant="outline" 
										size="sm" 
										className="gap-2 bg-background/50 border-border hover:bg-muted/50"
									>
										<Package className="w-4 h-4" />
										<span className="hidden sm:inline">Manage</span>
									</Button>
								</Link>
							)}
							<Link to="/orders">
								<Button 
									variant="outline" 
									size="sm" 
									className="gap-2 bg-background/50 border-border hover:bg-muted/50"
								>
									<Package className="w-4 h-4" />
									<span className="hidden sm:inline">Orders</span>
								</Button>
							</Link>
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button 
											variant="outline" 
											size="sm" 
											className="gap-2 bg-background/50 border-border hover:bg-muted/50"
										>
											<User className="w-4 h-4" />
											<span className="hidden sm:inline">{user?.email}</span>
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end">
										<DropdownMenuLabel>My Account</DropdownMenuLabel>
										<DropdownMenuSeparator />
										<DropdownMenuItem onClick={logout}>
											<LogOut className="w-4 h-4 mr-2" />
											Logout
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</>
						) : (
							<>
								<Link to="/login">
									<Button 
										variant="outline" 
										size="sm" 
										className="gap-2 bg-background/50 border-border hover:bg-muted/50"
									>
										<User className="w-4 h-4" />
										<span className="hidden sm:inline">Login</span>
									</Button>
								</Link>
							</>
						)}
						<CartSidebar>
							<Button 
								variant="outline" 
								size="sm" 
								className="gap-2 bg-background/50 border-border hover:bg-muted/50"
							>
								<ShoppingCart className="w-4 h-4" />
								<span className="hidden sm:inline">Cart</span>
							</Button>
						</CartSidebar>
					</div>
				</div>
			</div>
		</header>
	);
}