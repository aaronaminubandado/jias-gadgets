import { Truck, RotateCcw, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Hero() {
	return (
		<>
			<section
				className="bg-foreground text-background"
				style={{
					backgroundImage:
						'radial-gradient(hsl(0 0% 100% / 0.07) 1px, transparent 1px)',
					backgroundSize: '24px 24px',
				}}
			>
				<div className="container mx-auto px-4 py-16 md:py-24">
					<p className="font-mono text-xs uppercase tracking-[0.25em] text-accent">
						The gadget shop
					</p>
					<h1 className="mt-4 max-w-2xl font-display text-4xl font-bold md:text-6xl">
						Tech that earns its desk space.
					</h1>
					<p className="mt-4 max-w-xl text-background/70">
						Phones, audio, and accessories — one catalog, picked by
						people who use them.
					</p>
					<Button asChild size="lg" className="mt-8">
						<a href="#products">Shop all products</a>
					</Button>
				</div>
			</section>

			<div className="border-b bg-background">
				<div className="container mx-auto grid grid-cols-1 gap-4 px-4 py-4 sm:grid-cols-3">
					<div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
						<Truck className="w-4 h-4 shrink-0" />
						Free shipping over $50
					</div>
					<div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
						<RotateCcw className="w-4 h-4 shrink-0" />
						30-day returns
					</div>
					<div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
						<ShieldCheck className="w-4 h-4 shrink-0" />
						Secure checkout with Stripe
					</div>
				</div>
			</div>
		</>
	);
}
