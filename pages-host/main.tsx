import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { PwaRegister } from "@/components/fillcue/pwa-register";
import { Home } from "@/routes/index";
import "../src/styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <PwaRegister />
    <Home />
  </StrictMode>,
);
