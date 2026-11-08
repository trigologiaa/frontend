import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Spinner } from "../../shared/Spinner";
import { useAuth } from "./context/useAuth";
import { ForbiddenPage } from "./pages/ForbiddenPage";

export function ProtectedRoute({ roles }) {
	const { user, loading } = useAuth();
	const location = useLocation();

	if (loading) return <Spinner />;
	if (!user) {
		return (
			<Navigate to="/login" replace state={{ returnTo: location.pathname }} />
		);
	}
	if (roles && !roles.includes(user.role)) return <ForbiddenPage />;
	return <Outlet />;
}
