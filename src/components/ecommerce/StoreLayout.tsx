import { Header } from '@/components/ecommerce/Header';
import { Footer } from '@/components/ecommerce/Footer';

interface StoreLayoutProps {
	children: React.ReactNode;
	/** Optional id for in-page anchor targets (e.g. products) */
	mainId?: string;
	mainClassName?: string;
}

export function StoreLayout({
	children,
	mainId,
	mainClassName = '',
}: StoreLayoutProps) {
	return (
		<div className="flex min-h-screen flex-col bg-background">
			<Header />
			<main
				id={mainId}
				className={`flex-1 ${mainClassName}`.trim()}
			>
				{children}
			</main>
			<Footer />
		</div>
	);
}
