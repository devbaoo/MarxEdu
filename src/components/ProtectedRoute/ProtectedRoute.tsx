import { useSelector } from 'react-redux';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { RootState } from '@/services/store/store';

interface ProtectedRouteProps {
    allowedRoles?: string[];
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
    const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        return <Navigate to="/unauthorized" replace />;
    }

    if (
        user &&
        user.role === "user" &&
        !user.isVerify &&
        location.pathname !== "/resend-verification"
    ) {
        return <Navigate to="/resend-verification" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute; 