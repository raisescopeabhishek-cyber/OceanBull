import { createRoot } from "react-dom/client"; // Updated import for React 18
import { BrowserRouter } from "react-router-dom"; // Import BrowserRouter
import App from "./App";
import "./index.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { Provider } from "react-redux";
import store, { persistor } from "./redux/ReduxStore";
import { PersistGate } from "redux-persist/integration/react";

import UserPanelConfig from "./utils/UserPanelConfig";
import ThemePanel from "./utils/ThemePanel";

// Get the root DOM element
const rootElement = document.getElementById("root");

// Create a root with React 18 API
const root = createRoot(rootElement);

// Render the App inside the Provider with the Redux store and BrowserRouter
root.render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <UserPanelConfig />
      <ThemePanel />
        <BrowserRouter future={{ v7_relativeSplatPath: true }}>
          <App className="scrollbar-hidden" />
        </BrowserRouter>
    </PersistGate>
  </Provider>
);

