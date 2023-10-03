import "./App.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import PlayScreen from "./component/PlayScreen";
import HomeScreen from "./component/HomeScreen";
import { WebSocketConTextProvider } from "./context";

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomeScreen />,
  },
  {
    path: "/play",
    element: <PlayScreen />,
  },
]);

function App() {
  return (
    <WebSocketConTextProvider>
      <RouterProvider router={router} />
    </WebSocketConTextProvider>
  );
}

export default App;
