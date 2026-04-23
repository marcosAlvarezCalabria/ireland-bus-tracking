import { BrowserRouter } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function App() {
  const { t } = useTranslation();

  return (
    <BrowserRouter>
      <main className="min-h-screen bg-white text-slate-950 dark:bg-slate-950 dark:text-white">
        <h1>{t("app_name")}</h1>
      </main>
    </BrowserRouter>
  );
}
