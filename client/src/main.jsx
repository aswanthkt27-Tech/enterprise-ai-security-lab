import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import keycloak from "./services/keycloak.js";

keycloak
  .init({
    onLoad: "login-required",
    checkLoginIframe: false,
  })
  .then((authenticated) => {
    if (!authenticated) {
      keycloak.login();
      return;
    }

    createRoot(document.getElementById("root")).render(
      <StrictMode>
        <App keycloak={keycloak} />
      </StrictMode>
    );
  })
  .catch((error) => {
    console.error("Keycloak initialization failed:", error);
  });
