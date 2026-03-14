import { Link } from "wouter";
import {
  Phone,
  Mail,
  MapPin,
  Instagram,
  Facebook,
  MessageCircle,
} from "lucide-react";
import { useLang } from "../i18n/LangContext";

export default function Footer() {
  const { t } = useLang();

  return (
    <footer className="bg-secondary text-white/80 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-white">
              <div className="p-2 rounded-xl bg-white/10">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-6 h-6"
                >
                  <path d="M12 2C8 2 6 5 6 8c0 3 2 4 2 7 0 2-1 4-1 5 1 0 3-1 4-3 1 2 3 3 4 3 0-1-1-3-1-5 0-3 2-4 2-7 0-3-2-6-6-6z" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold">Dr. Senhaji Jalil</span>
                <span className="text-sm text-white/60">{t.nav.services}</span>
              </div>
            </div>
            <p className="text-white/60 text-sm leading-relaxed max-w-sm">
              {t.footer.description}
            </p>
            <div className="flex gap-4 pt-2">
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold text-lg mb-6">
              {t.nav.contact}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/"
                  className="hover:text-primary transition-colors inline-flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />{" "}
                  {t.nav.home}
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="hover:text-primary transition-colors inline-flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />{" "}
                  {t.nav.about}
                </Link>
              </li>
              <li>
                <Link
                  href="/services"
                  className="hover:text-primary transition-colors inline-flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />{" "}
                  {t.nav.services}
                </Link>
              </li>
              <li>
                <Link
                  href="/appointment"
                  className="hover:text-primary transition-colors inline-flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />{" "}
                  {t.nav.appointment}
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-primary transition-colors inline-flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />{" "}
                  {t.nav.contact}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold text-lg mb-6">
              {t.footer.schedule}
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span className="text-white/70">Casablanca, Maroc</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary shrink-0" />
                <a
                  href="tel:+212707151514"
                  className="hover:text-white transition-colors"
                >
                  +212 707 15 15 14
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary shrink-0" />
                <a
                  href="mailto:cdsstomato@gmail.com"
                  className="hover:text-white transition-colors"
                >
                  cdsstomato@gmail.com
                </a>
              </li>
              <li className="text-sm text-white/60">
                {t.footer.monday_friday}: 9h-19h
                <br />
                {t.footer.saturday}: 9h-14h
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 text-center text-sm text-white/50 flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© 2025 Dr. Senhaji Jalil. {t.footer.rights}</p>
        </div>
      </div>
    </footer>
  );
}
