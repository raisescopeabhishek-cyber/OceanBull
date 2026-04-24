import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { Provider } from "react-redux";
import store, { persistor } from "./redux/ReduxStore";
import { PersistGate } from "redux-persist/integration/react";

import UserPanelConfig from "./utils/UserPanelConfig";
import ThemePanel from "./utils/ThemePanel";

const rootElement = document.getElementById("root");
const root = createRoot(rootElement);

root.render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <BrowserRouter future={{ v7_relativeSplatPath: true }}>
          <UserPanelConfig />
      <ThemePanel />
        <App />
      </BrowserRouter>
    </PersistGate>
  </Provider>
);