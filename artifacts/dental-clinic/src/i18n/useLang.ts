import { useState, useEffect } from "react";
import { translations, type Lang, type TranslationKeys } from "./translations";

export function useLang() {
  const [lang, setLangState] = useState<Lang>(() => {
    const stored = localStorage.getItem("lang");
    return (stored as Lang) || "fr";
  });

  useEffect(() => {
    const root = document.documentElement;
    const isRTL = lang === "ar" || lang === "darija";

    root.setAttribute("dir", isRTL ? "rtl" : "ltr");
    root.setAttribute("lang", lang);

    if (lang === "ar" || lang === "darija") {
      root.classList.add("font-arabic");
    } else {
      root.classList.remove("font-arabic");
    }
  }, [lang]);

  const setLang = (newLang: Lang) => {
    setLangState(newLang);
    localStorage.setItem("lang", newLang);
  };

  const t: TranslationKeys = translations[lang];
  const isRTL = lang === "ar" || lang === "darija";

  return { lang, setLang, t, isRTL };
}
