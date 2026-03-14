import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { translations } from "./translations";

type Lang = "fr" | "en" | "ar" | "darija";

interface LangContextType {
  lang: Lang | null;
  setLang: (lang: Lang) => void;
  t: (typeof translations)["fr"];
  isRTL: boolean;
}

const LangContext = createContext<LangContextType | null>(null);

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang | null>(
    () => (localStorage.getItem("lang") as Lang) || null,
  );

  const setLang = (newLang: Lang) => {
    localStorage.setItem("lang", newLang);
    setLangState(newLang);
  };

  const isRTL = lang === "ar" || lang === "darija";
  const t = translations[lang || "fr"];

  useEffect(() => {
    document.documentElement.dir = isRTL ? "rtl" : "ltr";
    document.documentElement.lang = lang || "fr";
    if (isRTL) {
      document.documentElement.classList.add("font-arabic");
    } else {
      document.documentElement.classList.remove("font-arabic");
    }
  }, [lang, isRTL]);

  return (
    <LangContext.Provider value={{ lang, setLang, t, isRTL }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used inside LangProvider");
  return ctx;
}
