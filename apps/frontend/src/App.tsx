import "leaflet/dist/leaflet.css";

import { BrowserRouter, Route, Routes } from "react-router-dom";

import { HomePage } from "./pages/HomePage";

export default function App() {
  return (
    <BrowserRouter
      future={{ v7_relativeSplatPath: true, v7_startTransition: true }}
    >
      <Routes>
        <Route element={<HomePage />} path="/" />
      </Routes>
    </BrowserRouter>
  );
}
