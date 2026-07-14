import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";

type ProtectedRouteProps = {
	children: React.ReactNode;
	/** Single role (legacy) or list of allowed staff roles */
	requiredRole?: string;
	requiredRoles?: string[];
};

export function ProtectedRoute({
	children,
	requiredRole,
	requiredRoles,
}: ProtectedRouteProps) {
	const { user, isLoading } = useAuth();

	if (isLoading) {
		return null;
	}

	if (!user) {
		return <Navigate to="/login" replace />;
	}

	const allowedRoles = requiredRoles ?? (requiredRole ? [requiredRole] : []);

	if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
		return <Navigate to="/" replace />;
	}

	return <>{children}</>;
}

export default ProtectedRoute;
