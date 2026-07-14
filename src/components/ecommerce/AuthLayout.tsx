import { ArrowLeft, Store } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';

interface AuthLayoutProps {
	children: React.ReactNode;
	pageTitle: string;
}

export function AuthLayout({ children, pageTitle }: AuthLayoutProps) {
	useEffect(() => {
		const previous = document.title;
		document.title = `${pageTitle} · Jia's Gadgets`;
		return () => {
			document.title = previous;
		};
	}, [pageTitle]);

	return (
		<div className="flex min-h-screen flex-col bg-background">
			<header className="border-b border-border bg-background">
				<div className="container mx-auto flex items-center justify-between px-4 py-4">
					<Link to="/" className="flex items-center gap-2">
						<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
							<Store className="h-5 w-5 text-primary-foreground" />
						</div>
						<span className="font-display text-xl font-bold text-foreground">
							Jia&apos;s Gadgets
						</span>
					</Link>
					<Link
						to="/"
						className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
					>
						<ArrowLeft className="h-4 w-4" />
						Back to store
					</Link>
				</div>
			</header>

			<div className="flex flex-1 items-center justify-center p-4">
				{children}
			</div>
		</div>
	);
}
