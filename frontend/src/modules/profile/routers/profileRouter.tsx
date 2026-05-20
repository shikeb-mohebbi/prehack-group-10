import OnboardingPage from "../pages/OnboardingPage";
import ProfilePage from "../pages/ProfilePage";

export const onboardingRoutes = [
  { path: "/onboarding", element: <OnboardingPage />, protected: true },
];

export const profileRoutes = [
  { path: "/profile", element: <ProfilePage />, protected: true, layout: true },
];
