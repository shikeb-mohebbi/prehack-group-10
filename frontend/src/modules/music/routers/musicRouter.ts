import React from "react";
import MusicPage from "../pages/MusicPage";

export const musicRoutes = [
  {
    path: "/music",
    element: React.createElement(MusicPage),
    protected: true,
    layout: true,
  },
];
