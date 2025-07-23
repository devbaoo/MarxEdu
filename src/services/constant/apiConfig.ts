export const BASE_URL = "https://quizlingo-mb7fv.ondigitalocean.app/api";
// export const BASE_URL = "http://localhost:8080/api";
//auth
export const LOGIN_ENDPOINT = `${BASE_URL}/auth/login`;
export const REGISTER_ENDPOINT = `${BASE_URL}/auth/register`;
export const VERIFY_EMAIL_ENDPOINT = `${BASE_URL}/auth/verify-email`;
export const RESEND_VERIFICATION_ENDPOINT = `${BASE_URL}/auth/resend-verification`;
export const FORGOT_PASSWORD_ENDPOINT = `${BASE_URL}/auth/forgot-password`;
export const RESET_PASSWORD_ENDPOINT = `${BASE_URL}/auth/reset-password`;
export const CHANGE_PASSWORD_ENDPOINT = `${BASE_URL}/auth/change-password`;
export const REFRESH_TOKEN_ENDPOINT = `${BASE_URL}/auth/refresh-token`;
//user
export const GET_PAYMENT_HISTORY_ENDPOINT = `${BASE_URL}/user/payment-history`;
export const GET_PROFILE_TOKEN_ENDPOINT = `${BASE_URL}/user/profile`;
export const UPDATE_PROFILE_ENDPOINT = `${BASE_URL}/user/profile`;
export const UPDATE_AVATAR_PROFILE_ENDPOINT = `${BASE_URL}/users/avatar`;
export const CHOOSE_TOPICS_ENDPOINT = `${BASE_URL}/user/topic`;
export const CHOOSE_LEVELS_ENDPOINT = `${BASE_URL}/user/level`;
export const CHOOSE_SKILLS_ENDPOINT = `${BASE_URL}/user/skill`;

//legacy lesson endpoints (deprecated - use Marxist Economics instead)
export const GET_LESSONS_ENDPOINT = `${BASE_URL}/lessons`; // DEPRECATED
export const GET_USER_LEARNING_PATH_ENDPOINT = `${BASE_URL}/user-lessons-learning-path`; // DEPRECATED  
export const GET_LESSON_BY_ID_ENDPOINT = (id: string) => `${BASE_URL}/lessons/${id}`; // DEPRECATED
export const COMPLETE_LESSON_ENDPOINT = `${BASE_URL}/progress`; // DEPRECATED
export const RETRY_LESSON_ENDPOINT = `${BASE_URL}/lessons/retry`; // DEPRECATED
export const GET_CHECK_COMPLETED_LESSON_ENDPOINT = (id: string) => `${BASE_URL}/check-completion/${id}`; // DEPRECATED
export const CREATE_LESSON_ENDPOINT = `${BASE_URL}/lessons`; // DEPRECATED
export const UPDATE_LESSON_ENDPOINT = (id: string) => `${BASE_URL}/lessons/${id}`; // DEPRECATED
export const DELETE_LESSON_ENDPOINT = (id: string) => `${BASE_URL}/lessons/${id}`; // DEPRECATED

//admin
export const GET_USERS_ENDPOINT = `${BASE_URL}/users`;
export const DELETE_USER_ENDPOINT = (id: string) => `${BASE_URL}/users/${id}`;
export const NOTIFICATIONS_ALL_ENDPOINT = `${BASE_URL}/admin/notifications/all`;
export const GET_ALL_LESSONS_ENDPOINT = `${BASE_URL}/admin/lessons`;
export const UPDATE_USER_ROLE_ENDPOINT = (id: string) =>
  `${BASE_URL}/users/${id}/role`;

//package
export const GET_PACKAGES_ENDPOINT = `${BASE_URL}/admin/packages`;
export const DELETE_PACKAGES_ENDPOINT = (id: string) =>
  `${BASE_URL}/admin/packages/${id}`;
export const CREATE_PACKAGES_ENDPOINT = `${BASE_URL}/admin/packages`;
export const UPDATE_PACKAGES_ENDPOINT = (id: string) =>
  `${BASE_URL}/admin/packages/${id}`;

//package user
export const GET_ACTIVE_PACKAGES_ENDPOINT = `${BASE_URL}/packages`;
export const GET_PACKAGE_DETAILS_ENDPOINT = (packageId: string) =>
  `${BASE_URL}/packages/${packageId}`;
export const GET_USER_ACTIVE_PACKAGE_ENDPOINT = `${BASE_URL}/packages/user/active`;
export const CREATE_PACKAGE_PURCHASE_ENDPOINT = `${BASE_URL}/packages/purchase`;
export const PAYMENT_CALLBACK_ENDPOINT = `${BASE_URL}/packages/payment-callback`;
export const CHECK_USER_PACKAGES_ENDPOINT = `${BASE_URL}/packages/user/check`;
export const PAYMENT_WEBHOOK_ENDPOINT = `${BASE_URL}/packages/webhook`;
export const CHECK_PAYMENT_STATUS_ENDPOINT = (transactionId: string) =>
  `${BASE_URL}/packages/payment/${transactionId}/status`;
export const CANCEL_PAYMENT_ENDPOINT = (transactionId: string) =>
  `${BASE_URL}/packages/payment/${transactionId}/cancel`;

//legacy english learning endpoints (deprecated - use Marxist Economics instead)
export const GET_TOPICS_ENDPOINT = `${BASE_URL}/topics`; // DEPRECATED
export const CREATE_TOPIC_ENDPOINT = `${BASE_URL}/topics`; // DEPRECATED
export const UPDATE_TOPIC_ENDPOINT = (id: string) => `${BASE_URL}/topics/${id}`; // DEPRECATED
export const DELETE_TOPIC_ENDPOINT = (id: string) => `${BASE_URL}/topics/${id}`; // DEPRECATED

export const GET_SKILLS_ENDPOINT = `${BASE_URL}/skills`; // DEPRECATED
export const CREATE_SKILL_ENDPOINT = `${BASE_URL}/skills`; // DEPRECATED
export const UPDATE_SKILL_ENDPOINT = (id: string) => `${BASE_URL}/skills/${id}`; // DEPRECATED
export const DELETE_SKILL_ENDPOINT = (id: string) => `${BASE_URL}/skills/${id}`; // DEPRECATED

export const GET_LEVELS_ENDPOINT = `${BASE_URL}/levels`; // DEPRECATED
export const CREATE_LEVEL_ENDPOINT = `${BASE_URL}/levels`; // DEPRECATED
export const UPDATE_LEVEL_ENDPOINT = (id: string) => `${BASE_URL}/levels/${id}`; // DEPRECATED
export const DELETE_LEVEL_ENDPOINT = (id: string) => `${BASE_URL}/levels/${id}`; // DEPRECATED

//notification
export const GET_NOTIFICATIONS_ENDPOINT = `${BASE_URL}/notifications`;
export const GET_NOTIFICATION_SETTINGS_ENDPOINT = `${BASE_URL}/notifications/settings`;
export const SETTING_NOTIFICATIONS_ENDPOINT = `${BASE_URL}/notifications/settings`;
export const READ_A_NOTIFICATION_ENDPOINT = (id: string) =>
  `${BASE_URL}/notifications/${id}/read`;
export const MARK_ALL_NOTIFICATIONS_READ_ENDPOINT = `${BASE_URL}/notifications/mark-all-read`;

//leaderboard
export const GET_LEADERBOARD_ENDPOINT = `${BASE_URL}/leaderboard`;

//marxist economics
export const GENERATE_MARXIST_LESSON_ENDPOINT = `${BASE_URL}/marxist-economics/generate-lesson`;
export const GET_MARXIST_LEARNING_PATH_ENDPOINT = `${BASE_URL}/marxist-economics/learning-path`;
export const GET_MARXIST_LESSON_BY_PATH_ENDPOINT = (pathId: string) => `${BASE_URL}/marxist-economics/lessons/${pathId}`;
export const COMPLETE_MARXIST_LESSON_ENDPOINT = `${BASE_URL}/marxist-economics/complete-lesson`;
export const RETRY_MARXIST_LESSON_ENDPOINT = `${BASE_URL}/marxist-economics/retry-lesson`;
export const GET_MARXIST_STATS_ENDPOINT = `${BASE_URL}/marxist-economics/stats`;
export const GET_MARXIST_TOPICS_ENDPOINT = `${BASE_URL}/marxist-economics/topics`;
export const ANALYZE_MARXIST_PROGRESS_ENDPOINT = `${BASE_URL}/marxist-economics/analyze-progress`;
export const TEST_MARXIST_CONNECTION_ENDPOINT = `${BASE_URL}/marxist-economics/test-connection`;
export const TEST_GEMINI_ENDPOINT = `${BASE_URL}/marxist-economics/test-gemini`;

//marxist topics management
export const CREATE_MARXIST_TOPIC_ENDPOINT = `${BASE_URL}/marxist-topics`;
export const GET_MARXIST_TOPICS_LIST_ENDPOINT = `${BASE_URL}/marxist-topics`;
export const GET_MARXIST_TOPIC_BY_ID_ENDPOINT = (id: string) => `${BASE_URL}/marxist-topics/${id}`;
export const UPDATE_MARXIST_TOPIC_ENDPOINT = (id: string) => `${BASE_URL}/marxist-topics/${id}`;
export const DELETE_MARXIST_TOPIC_ENDPOINT = (id: string) => `${BASE_URL}/marxist-topics/${id}`;
export const SEED_MARXIST_TOPICS_ENDPOINT = `${BASE_URL}/marxist-topics/seed`;
