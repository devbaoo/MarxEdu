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
import PhilosophyDashboard from "@/page/Philosophy/PhilosophyDashboard";
import PhilosophyTopicsPage from "@/page/Staff/PhilosophyTopicsPage";
import PhilosophyLessonsPage from "@/page/Staff/PhilosophyLessonsPage";
import PhilosophyStatsPage from "@/page/Staff/PhilosophyStatsPage";
import MultiAITestPage from "@/page/Staff/MultiAITestPage";
import PerformanceMonitorPage from "@/page/Staff/PerformanceMonitorPage";
import PhilosophyLessonDetailPage from "@/page/Philosophy/PhilosophyLessonDetailPage";
import SurveyManagementPage from "@/page/Admin/SurveyManagementPage";
import PhilosophyLessonTestPage from "@/page/Philosophy/PhilosophyLessonTestPage";
import FlashcardsPage from "@/page/Philosophy/FlashcardsPage";

const AppRouter = () => {
  const { isAuthenticated, user } = useSelector(
    (state: RootState) => state.auth
  );

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
    return "/philosophy";
  };

  return (
    <Routes>
      <Route path="/resend-verification" element={<ResendVerificationPage />} />
      <Route path="/verify-email/:token" element={<VerifyEmailPage />} />

      {/* Guest Routes - Only accessible when not authenticated */}
      <Route
        element={
          !isAuthenticated ? (
            <GuestLayout />
          ) : (
            <Navigate to={getInitialRoute()} />
          )
        }>
        <Route path="/" element={<HomePage />} />
        <Route path="/home" element={<HomePage />} />
      </Route>

      {/* Auth Routes - Only accessible when not authenticated */}
      <Route
        element={
          !isAuthenticated ? (
            <AuthLayout />
          ) : (
            <Navigate to={getInitialRoute()} />
          )
        }>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<LoginPage isRegister={true} />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
      </Route>

      {/* User Routes - Only accessible when authenticated as user */}
      <Route element={<ProtectedRoute allowedRoles={["user"]} />}>
        <Route element={<UserLayout />}>
          {/* DEPRECATED: Redirect old lesson routes to Marxist Economics */}
          <Route
            path="/learn"
            element={<Navigate to="/philosophy" replace />}
          />
          <Route
            path="/lesson/:id"
            element={<Navigate to="/philosophy" replace />}
          />
          <Route
            path="/lesson/submit"
            element={<Navigate to="/philosophy" replace />}
          />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/history-payment" element={<HistoryPaymentPage />} />
          <Route path="/setting" element={<NotificationSettings />} />
          <Route path="/rank" element={<Rank />} />
          <Route path="/packages" element={<Package />} />
          <Route path="/philosophy" element={<PhilosophyDashboard />} />
          <Route path="/flashcards" element={<FlashcardsPage />} />
          <Route
            path="/philosophy-lesson/:pathId"
            element={<PhilosophyLessonDetailPage />}
          />
          <Route
            path="/philosophy-test/:pathId"
            element={<PhilosophyLessonTestPage />}
          />
          {/* Redirect old routes to new philosophy routes */}
          <Route
            path="/marxist-economics"
            element={<Navigate to="/philosophy" replace />}
          />
          <Route
            path="/marxist-lesson/:pathId"
            element={<Navigate to="/philosophy" replace />}
          />
          <Route
            path="/marxist-test/:pathId"
            element={<Navigate to="/philosophy" replace />}
          />
        </Route>

        {/* Payment Routes */}
        <Route path="/payment/return" element={<PaymentReturn />} />
        <Route path="/payment/cancel" element={<PaymentCancel />} />

        {/* Choose Process Routes */}
        <Route
          path="/choose-topic"
          element={<Process currentStep={1} Page={<TopicPage />} />}
        />
        <Route
          path="/choose-level"
          element={<Process currentStep={2} Page={<LevelPage />} />}
        />
        <Route
          path="/choose-skill"
          element={<Process currentStep={3} Page={<SkillPage />} />}
        />
        <Route
          path="/done-page"
          element={<Process currentStep={4} Page={<DonePage />} />}
        />
      </Route>

      {/* Admin Routes - Only accessible when authenticated as admin */}
      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="packages" element={<AdminPackage />} />
          <Route path="users" element={<ManageUserPage />} />
          <Route path="notifications/all" element={<NotificationsAllPage />} />
          <Route path="survey" element={<SurveyManagementPage />} />
        </Route>
      </Route>

      {/* Staff Routes - Only accessible when authenticated as staff */}
      <Route element={<ProtectedRoute allowedRoles={["staff"]} />}>
        <Route path="/staff" element={<StaffLayout />}>
          <Route index element={<StaffDashboard />} />
          <Route path="philosophy-topics" element={<PhilosophyTopicsPage />} />
          <Route
            path="philosophy-lessons"
            element={<PhilosophyLessonsPage />}
          />
          <Route path="philosophy-stats" element={<PhilosophyStatsPage />} />
          <Route
            path="performance-monitor"
            element={<PerformanceMonitorPage />}
          />
          {/* Redirect old staff routes to new philosophy routes */}
          <Route
            path="marxist-topics"
            element={<Navigate to="/staff/philosophy-topics" replace />}
          />
          <Route
            path="marxist-lessons"
            element={<Navigate to="/staff/philosophy-lessons" replace />}
          />
          <Route
            path="marxist-stats"
            element={<Navigate to="/staff/philosophy-stats" replace />}
          />
          <Route path="gemini-test" element={<MultiAITestPage />} />
        </Route>
      </Route>

      {/* Common Routes */}
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRouter;
