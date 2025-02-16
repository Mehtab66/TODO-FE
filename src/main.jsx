import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router";
import { Auth0Provider } from "@auth0/auth0-react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Auth0Provider
        domain={import.meta.env.VITE_DOMAIN}
        clientId={import.meta.env.VITE_CLIENT_ID}
        authorizationParams={{
          audience: import.meta.env.VITE_AUDIENCE,
          redirect_uri: window.location.origin,
        }}
        cacheLocation="localstorage"
      >
        <App />
        <ToastContainer />
      </Auth0Provider>
    </BrowserRouter>
  </StrictMode>
);
