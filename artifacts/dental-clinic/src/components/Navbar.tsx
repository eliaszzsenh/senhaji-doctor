import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Phone, Calendar, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLang } from "../i18n/LangContext";

export default function Navbar() {
  const { t, lang, setLang, isRTL } = useLang();
  const [location] = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: t.nav.home, href: "/" },
    { label: t.nav.about, href: "/about" },
    { label: t.nav.services, href: "/services" },
    { label: t.nav.contact, href: "/contact" },
  ];

  const cycleLang = () => {
    const langs: ("fr" | "en" | "ar" | "darija")[] = [
      "fr",
      "en",
      "ar",
      "darija",
    ];
    const idx = langs.indexOf(lang as "fr" | "en" | "ar" | "darija");
    setLang(langs[(idx + 1) % 4]);
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm py-3"
          : "bg-white lg:bg-transparent py-4 lg:py-6",
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <Link
          href="/"
          className={cn(
            "flex items-center gap-2 group transition-colors",
            isScrolled ? "text-secondary" : "text-secondary lg:text-white",
          )}
        >
          <div
            className={cn(
              "p-2 rounded-xl bg-gradient-to-br from-primary to-orange-400 shadow-lg group-hover:shadow-primary/25 transition-all",
            )}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-6 h-6 text-white"
            >
              <path
                d="M12 20a10 10 0 1 1 0-20c5.523 0 10 4.477 10 10a1 1 0 0 1-1 1h-3a1 1 0 0 0-1 1v4a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1v-4a1 1 0 0 0-1-1H3a1 1 0 0 1-1-1z"
                opacity="0"
              />
              <path d="M12 2C8 2 6 5 6 8c0 3 2 4 2 7 0 2-1 4-1 5 1 0 3-1 4-3 1 2 3 3 4 3 0-1-1-3-1-5 0-3 2-4 2-7 0-3-2-6-6-6z" />
            </svg>
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-lg font-bold">Dr. Senhaji</span>
            <span
              className={cn(
                "text-xs font-medium opacity-80",
                isScrolled
                  ? "text-slate-500"
                  : "text-slate-500 lg:text-white/80",
              )}
            >
              Dentaire
            </span>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-8">
          {navItems.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-semibold transition-colors hover:text-primary relative after:absolute after:-bottom-1 after:left-0 after:w-full after:h-0.5 after:bg-primary after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:origin-left",
                location === link.href
                  ? "text-primary after:scale-x-100"
                  : isScrolled
                    ? "text-slate-600"
                    : "text-white/90",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-4">
          <button
            onClick={cycleLang}
            className={cn(
              "flex items-center gap-2 text-sm font-semibold transition-colors hover:text-primary",
              isScrolled ? "text-slate-600" : "text-white",
            )}
          >
            <Globe className="w-4 h-4" />
            <span className="uppercase">{lang}</span>
          </button>
          <a
            href="tel:+212707151514"
            className={cn(
              "flex items-center gap-2 text-sm font-semibold transition-colors hover:text-primary",
              isScrolled ? "text-slate-600" : "text-white",
            )}
          >
            <Phone className="w-4 h-4" />
            <span>+212 707 15 15 14</span>
          </a>
          <Link
            href="/appointment"
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-white font-semibold shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-0.5 transition-all"
          >
            <Calendar className="w-4 h-4" />
            {t.nav.appointment}
          </Link>
        </div>

        <button
          className={cn(
            "lg:hidden p-2 -mr-2",
            isScrolled ? "text-slate-900" : "text-slate-900 lg:text-white",
          )}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      <div
        className={cn(
          "lg:hidden absolute top-full left-0 w-full bg-white shadow-xl transition-all duration-300 overflow-hidden",
          mobileMenuOpen
            ? "max-h-[400px] opacity-100 border-t border-slate-100"
            : "max-h-0 opacity-0",
        )}
      >
        <div className="px-4 py-6 flex flex-col gap-4">
          {navItems.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-lg font-semibold px-4 py-2 rounded-lg transition-colors",
                location === link.href
                  ? "bg-accent text-secondary"
                  : "text-slate-700 hover:bg-slate-50",
              )}
            >
              {link.label}
            </Link>
          ))}
          <div className="h-px bg-slate-100 my-2" />
          <Link
            href="/appointment"
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-white font-bold"
          >
            <Calendar className="w-5 h-5" />
            {t.nav.appointment}
          </Link>
        </div>
      </div>
    </header>
  );
}
