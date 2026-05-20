import WorkoutsPage from "../pages/WorkoutsPage";

export const workoutRoutes = [
  { path: "/workouts", element: <WorkoutsPage />, protected: true, layout: true },
];
