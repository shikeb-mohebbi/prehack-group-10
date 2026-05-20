import ChatPage from "../pages/ChatPage";

export const chatRoutes = [
  { path: "/chat", element: <ChatPage />, protected: true, layout: true },
];
