import { Store, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
	return (
		<footer className="bg-foreground text-background">
			<div className="container mx-auto px-4 py-12">
				<div className="grid grid-cols-1 gap-10 md:grid-cols-3">
					{/* Brand */}
					<div>
						<div className="flex items-center gap-2">
							<div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
								<Store className="w-5 h-5 text-white" />
							</div>
							<span className="text-lg font-display font-bold">
								Jia's Gadgets
							</span>
						</div>
						<p className="mt-4 text-sm text-background/70">
							One shared catalog of gadgets we actually rate.
						</p>
					</div>

					{/* Shop */}
					<div>
						<h3 className="font-mono text-xs uppercase tracking-[0.25em] text-background/60">
							Shop
						</h3>
						<ul className="mt-4 space-y-2 text-sm">
							<li>
								<Link
									to="/"
									className="text-background/80 hover:text-background transition-colors"
								>
									All products
								</Link>
							</li>
							<li>
								<Link
									to="/orders"
									className="text-background/80 hover:text-background transition-colors"
								>
									My orders
								</Link>
							</li>
						</ul>
					</div>

					{/* Help */}
					<div>
						<h3 className="font-mono text-xs uppercase tracking-[0.25em] text-background/60">
							Help
						</h3>
						<ul className="mt-4 space-y-2 text-sm text-background/80">
							<li>hello@jiasgadgets.com</li>
							<li>30-day returns</li>
							<li>Ships worldwide</li>
						</ul>
					</div>
				</div>
			</div>

			<div className="border-t border-background/15">
				<div className="container mx-auto px-4 py-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					<p className="text-xs text-background/60">
						&copy; {new Date().getFullYear()} Jia's Gadgets
					</p>
					<p className="flex items-center gap-2 text-xs text-background/60">
						<ShieldCheck className="w-4 h-4" />
						Payments secured by Stripe
					</p>
				</div>
			</div>
		</footer>
	);
}
