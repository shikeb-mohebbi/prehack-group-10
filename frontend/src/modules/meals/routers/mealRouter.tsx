import MealsPage from "../pages/MealsPage";

export const mealRoutes = [
  { path: "/meals", element: <MealsPage />, protected: true, layout: true },
];
