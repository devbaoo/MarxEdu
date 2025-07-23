import ForgotPasswordPage from "@/page/Auth/ForgotPasswordPage";
import LoginPage from "@/page/Auth/LoginPage";
import LevelPage from "@/page/Choose/LevelPage";
import SkillPage from "@/page/Choose/SkillPage";
import TopicPage from "@/page/Choose/TopicPage";
import HomePage from "@/page/Home/HomePage";
import VerifyEmailPage from "@/page/Auth/VerifyEmailPage";
import ResendVerificationPage from "@/page/Auth/ResendVerificationPage";
import ResetPasswordPage from "@/page/Auth/ResetPasswordPage";
import NotFoundPage from "@/page/Error/NotFoundPage";
import UnauthorizedPage from "@/page/Error/UnauthorizedPage";
import ProtectedRoute from "@/components/ProtectedRoute/ProtectedRoute";
import AdminLayout from "@/components/Layout/AdminLayout";
import UserLayout from "@/components/Layout/UserLayout";
import GuestLayout from "@/components/Layout/GuestLayout";
import AuthLayout from "@/components/Layout/AuthLayout";
import AdminDashboard from "@/page/Admin/AdminDashboard";
import { Route, Routes, Navigate } from "react-router-dom";
import Process from "@/components/Process/Process";
import DonePage from "@/page/Choose/DoneChoose";
// DEPRECATED: These pages now redirect to Marxist Economics
// import LearnPage from "@/page/User/LearnPage";
// import LessonPage from "@/page/User/LessonPage";
// import LessonSubmitPage from "@/page/User/LessonSubmitPage";
import ProfilePage from "@/page/User/ProfilePage";
import { useSelector } from "react-redux";
import { RootState } from "@/services/store/store";
import ManageUserPage from "@/page/Admin/ManageUserPage";
// Legacy English learning imports (deprecated)
// import SkillsPage from "@/page/Staff/SkillsPage";
// import LessonsPage from "@/page/Staff/LessonsPage";
// import LevelsPage from "@/page/Staff/LevelsPage";
// import SpeakingLessonPage from "@/page/Staff/SpeakingLessonPage";
// import TopicsLesson from "@/page/Staff/TopicsLesson";
import AdminPackage from "@/page/Admin/AdminPackage";
import NotificationSettings from "@/page/User/NotificationSetting";
import NotificationsAllPage from "@/page/Admin/NotificationsAllPage";
import Rank from "@/page/User/Rank";
import StaffDashboard from "@/page/Staff/StaffDashboard";
import StaffLayout from "@/components/Layout/StaffLayout";
import Package from "@/page/User/Package";
import PaymentReturn from "@/page/Payment/PaymentReturn";
import PaymentCancel from "@/page/Payment/PaymentCancel";
import HistoryPaymentPage from "@/page/User/HistoryPayment";
import MarxistDashboard from "@/page/Marxist/MarxistDashboard";
import MarxistTopicsPage from "@/page/Staff/MarxistTopicsPage";
import MarxistLessonsPage from "@/page/Staff/MarxistLessonsPage";
import MarxistStatsPage from "@/page/Staff/MarxistStatsPage";
import GeminiTestPage from "@/page/Staff/GeminiTestPage";
import MarxistLessonDetailPage from "@/page/Marxist/MarxistLessonDetailPage";
import MarxistLessonTestPage from "@/page/Marxist/MarxistLessonTestPage";


const AppRouter = () => {
    const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

    // Redirect based on user role
    const getInitialRoute = () => {
        if (!isAuthenticated) {
            return "/login";
        }
        if (user?.role === "admin") {
            return "/admin";
        }
        if (user?.role === "staff") {
            return "/staff";
        }
        return "/marxist-economics";
    };

    return (
        <Routes>
            <Route path="/resend-verification" element={<ResendVerificationPage />} />
            <Route path="/verify-email/:token" element={<VerifyEmailPage />} />

            {/* Guest Routes - Only accessible when not authenticated */}
            <Route element={!isAuthenticated ? <GuestLayout /> : <Navigate to={getInitialRoute()} />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/home" element={<HomePage />} />
            </Route>

            {/* Auth Routes - Only accessible when not authenticated */}
            <Route element={!isAuthenticated ? <AuthLayout /> : <Navigate to={getInitialRoute()} />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<LoginPage isRegister={true} />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
            </Route>

            {/* User Routes - Only accessible when authenticated as user */}
            <Route element={<ProtectedRoute allowedRoles={["user"]} />}>
                <Route element={<UserLayout />}>
                    {/* DEPRECATED: Redirect old lesson routes to Marxist Economics */}
                    <Route path="/learn" element={<Navigate to="/marxist-economics" replace />} />
                    <Route path="/lesson/:id" element={<Navigate to="/marxist-economics" replace />} />
                    <Route path="/lesson/submit" element={<Navigate to="/marxist-economics" replace />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/history-payment" element={<HistoryPaymentPage />} />
                    <Route path="/setting" element={<NotificationSettings />} />
                    <Route path="/rank" element={<Rank />} />
                    <Route path="/packages" element={<Package />} />
                    <Route path="/marxist-economics" element={<MarxistDashboard />} />
                    <Route path="/marxist-lesson/:pathId" element={<MarxistLessonDetailPage />} />
                    <Route path="/marxist-test/:pathId" element={<MarxistLessonTestPage />} />
                </Route>

                {/* Payment Routes */}
                <Route path="/payment/return" element={<PaymentReturn />} />
                <Route path="/payment/cancel" element={<PaymentCancel />} />

                {/* Choose Process Routes */}
                <Route path="/choose-topic" element={<Process currentStep={1} Page={<TopicPage />} />} />
                <Route path="/choose-level" element={<Process currentStep={2} Page={<LevelPage />} />} />
                <Route path="/choose-skill" element={<Process currentStep={3} Page={<SkillPage />} />} />
                <Route path="/done-page" element={<Process currentStep={4} Page={<DonePage />} />} />
            </Route>

            {/* Admin Routes - Only accessible when authenticated as admin */}
            <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
                <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<AdminDashboard />} />
                    <Route path="packages" element={<AdminPackage />} />
                    <Route path="users" element={<ManageUserPage />} />
                    <Route path="notifications/all" element={<NotificationsAllPage />} />

                </Route>
            </Route>

            {/* Staff Routes - Only accessible when authenticated as staff */}
            <Route element={<ProtectedRoute allowedRoles={["staff"]} />}>
                <Route path="/staff" element={<StaffLayout />}>
                    <Route index element={<StaffDashboard />} />
                    <Route path="marxist-topics" element={<MarxistTopicsPage />} />
                    <Route path="marxist-lessons" element={<MarxistLessonsPage />} />
                    <Route path="marxist-stats" element={<MarxistStatsPage />} />
                    <Route path="gemini-test" element={<GeminiTestPage />} />
                </Route>
            </Route>

            {/* Common Routes */}
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
}

export default AppRouter;