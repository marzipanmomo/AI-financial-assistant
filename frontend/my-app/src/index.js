import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { ToastProvider } from "./Toast";
import { CurrencyProvider } from "./CurrencyContext";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <BrowserRouter>
    <CurrencyProvider>
      <ToastProvider>
        <App />
      </ToastProvider>
    </CurrencyProvider>
  </BrowserRouter>
);