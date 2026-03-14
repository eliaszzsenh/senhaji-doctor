import { Globe } from "lucide-react";

type Lang = "fr" | "en" | "ar" | "darija";

const LANGUAGES: { code: Lang; label: string; flag: string }[] = [
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "ar", label: "العربية", flag: "🇸🇦" },
  { code: "darija", label: "Darija", flag: "🇲🇦" },
];

interface LanguagePickerProps {
  onSelect: (lang: Lang) => void;
}

export default function LanguagePicker({ onSelect }: LanguagePickerProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />

      <div className="relative z-10 w-full max-w-md px-6 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Centre Dentaire Senhaji
          </h1>
          <p className="text-white/70 text-lg">
            اختر لغتك / Choose your language
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => onSelect(lang.code)}
              className="flex flex-col items-center justify-center p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 hover:bg-white/20 hover:scale-105 transition-all group"
            >
              <span className="text-4xl mb-3">{lang.flag}</span>
              <span className="text-white font-semibold text-lg group-hover:text-accent transition-colors">
                {lang.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
