import { motion } from "framer-motion";
import { Link } from "wouter";
import {
  Calendar,
  ArrowRight,
  ShieldCheck,
  Globe2,
  Zap,
  Award,
  Star,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";
import { useLang } from "../i18n/LangContext";

const SERVICES = [
  { id: 1, key: "general" },
  { id: 2, key: "endodontics" },
  { id: 3, key: "aesthetic" },
  { id: 4, key: "prosthesis" },
  { id: 5, key: "surgery" },
  { id: 6, key: "laser" },
];

const TESTIMONIALS_INITIALS = [
  { name: "YB", bg: "bg-blue-500" },
  { name: "FZ", bg: "bg-orange-500" },
  { name: "MD", bg: "bg-green-500" },
];

export default function Home() {
  const { t } = useLang();

  const getServiceTitle = (key: string) => {
    const serviceKeys: Record<string, string> = {
      general: t.services.general,
      endodontics: t.services.endodontics,
      aesthetic: t.services.aesthetic,
      prosthesis: t.services.prosthesis,
      surgery: t.services.surgery,
      laser: t.services.laser,
    };
    return serviceKeys[key] || key;
  };

  const getServiceDesc = (key: string) => {
    const descKeys: Record<string, string> = {
      general: t.services.general_desc,
      endodontics: t.services.endodontics_desc,
      aesthetic: t.services.aesthetic_desc,
      prosthesis: t.services.prosthesis_desc,
      surgery: t.services.surgery_desc,
      laser: t.services.laser_desc,
    };
    return descKeys[key] || key;
  };

  return (
    <main className="w-full">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-secondary">
        <div className="absolute inset-0 z-0">
          <img
            src={`${import.meta.env.BASE_URL}images/hero-bg.png`}
            alt="Dental Background"
            className="w-full h-full object-cover opacity-80 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-secondary/90 to-secondary/40" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block py-1 px-3 rounded-full bg-accent/20 text-accent font-semibold text-sm mb-6 backdrop-blur-md border border-accent/20">
                {t.services.title}
              </span>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                {t.hero.title.split(" ").slice(0, 2).join(" ")} <br />
                <span className="text-primary">
                  {t.hero.title.split(" ").slice(2).join(" ")}
                </span>
              </h1>
              <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl leading-relaxed">
                {t.hero.subtitle}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-16">
                <Link
                  href="/appointment"
                  className="px-8 py-4 rounded-full bg-primary text-white font-bold text-lg shadow-lg shadow-primary/30 hover:shadow-xl hover:-translate-y-1 transition-all text-center flex justify-center items-center gap-2"
                >
                  <Calendar className="w-5 h-5" />
                  {t.hero.cta_primary}
                </Link>
                <Link
                  href="/about"
                  className="px-8 py-4 rounded-full bg-white/10 text-white font-bold text-lg backdrop-blur-sm border border-white/20 hover:bg-white/20 hover:-translate-y-1 transition-all text-center"
                >
                  {t.hero.cta_secondary}
                </Link>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8 border-t border-white/10">
                <div className="flex items-center gap-2 text-white/90">
                  <ShieldCheck className="w-5 h-5 text-accent" />
                  <span className="text-sm font-medium">25+ ans</span>
                </div>
                <div className="flex items-center gap-2 text-white/90">
                  <Globe2 className="w-5 h-5 text-accent" />
                  <span className="text-sm font-medium">4 langues</span>
                </div>
                <div className="flex items-center gap-2 text-white/90">
                  <Zap className="w-5 h-5 text-accent" />
                  <span className="text-sm font-medium">
                    {t.services.laser}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-white/90">
                  <Award className="w-5 h-5 text-accent" />
                  <span className="text-sm font-medium">DSD</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-sm font-bold text-primary tracking-wider uppercase mb-2">
              {t.services.title}
            </h2>
            <h3 className="text-3xl md:text-4xl font-bold text-slate-900">
              {t.services.title}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {SERVICES.map((s, i) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 hover:shadow-xl hover:border-primary/20 transition-all group"
              >
                <div className="w-14 h-14 bg-accent/50 rounded-xl flex items-center justify-center text-secondary mb-6 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all">
                  <span className="text-2xl font-bold">0{s.id}</span>
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-3">
                  {getServiceTitle(s.key)}
                </h4>
                <p className="text-slate-600 mb-6">{getServiceDesc(s.key)}</p>
                <Link
                  href="/services"
                  className="inline-flex items-center gap-2 text-primary font-semibold group-hover:gap-3 transition-all"
                >
                  {t.hero.cta_secondary} <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-secondary text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-5 pointer-events-none">
          <svg
            className="absolute w-full h-full"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern
                id="grid"
                width="40"
                height="40"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-white/10">
            <div>
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                25+
              </div>
              <div className="text-white/80 font-medium">
                {t.about.description1.split(" ").slice(0, 4).join(" ")}
              </div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                4
              </div>
              <div className="text-white/80 font-medium">langues</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                DSD
              </div>
              <div className="text-white/80 font-medium">certifié</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                Laser
              </div>
              <div className="text-white/80 font-medium">diode</div>
            </div>
          </div>
        </div>
      </section>

      {/* About Preview */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:w-1/2 relative"
            >
              <div className="absolute inset-0 bg-primary translate-x-4 translate-y-4 rounded-3xl" />
              <img
                src={`${import.meta.env.BASE_URL}images/doctor.png`}
                alt="Dr. Senhaji Jalil"
                className="relative z-10 w-full rounded-3xl shadow-xl object-cover aspect-[3/4]"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:w-1/2"
            >
              <h2 className="text-sm font-bold text-primary tracking-wider uppercase mb-2">
                {t.about.title}
              </h2>
              <h3 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                {t.about.subtitle}
              </h3>
              <div className="space-y-4 text-lg text-slate-600 mb-8">
                <p>{t.about.description1}</p>
                <p>{t.about.description2}</p>
                <p>{t.about.description3}</p>
              </div>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-secondary text-white font-semibold hover:bg-blue-800 transition-colors"
              >
                {t.about.cta} <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              {t.testimonials.title}
            </h3>
            <p className="text-slate-600 max-w-2xl mx-auto">
              {t.about.description1.split(".").slice(0, 1).join("")}.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {t.testimonials.items.map((item, i) => (
              <div
                key={i}
                className="bg-white p-8 rounded-2xl shadow-sm border-l-4 border-primary relative"
              >
                <span className="absolute top-4 right-4 text-6xl text-slate-200 font-serif leading-none">
                  "
                </span>
                <div className="flex items-center gap-4 mb-6 relative z-10">
                  <div
                    className={`w-12 h-12 ${TESTIMONIALS_INITIALS[i].bg} rounded-full flex items-center justify-center text-white font-bold text-sm`}
                  >
                    {TESTIMONIALS_INITIALS[i].name}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{item.name}</p>
                    <p className="text-sm text-slate-500">{item.location}</p>
                  </div>
                </div>
                <div className="flex text-amber-400 mb-3">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-slate-700 mb-4 relative z-10">{item.text}</p>
                <div className="flex items-center gap-2 text-sm text-slate-500 border-t pt-4">
                  <span className="font-medium text-primary">
                    {item.service}
                  </span>
                  <span>•</span>
                  <span>{item.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-primary py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {t.hero.cta_primary}
          </h2>
          <p className="text-white/90 text-lg mb-8">
            Prenez rendez-vous en quelques minutes.
          </p>
          <Link
            href="/appointment"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary font-bold rounded-full hover:shadow-xl hover:scale-105 transition-all text-lg"
          >
            <Calendar className="w-5 h-5" />
            {t.hero.cta_primary}
          </Link>
        </div>
      </section>

      {/* Contact Preview */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div>
              <h2 className="text-sm font-bold text-primary tracking-wider uppercase mb-2">
                {t.contact.title}
              </h2>
              <h3 className="text-3xl font-bold text-slate-900 mb-8">
                {t.contact.subtitle}
              </h3>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center text-secondary shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">
                      {t.contact.phone}
                    </h4>
                    <p className="text-slate-600">+212 707 15 15 14</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center text-secondary shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">
                      {t.contact.email}
                    </h4>
                    <p className="text-slate-600">cdsstomato@gmail.com</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center text-secondary shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">
                      {t.contact.location}
                    </h4>
                    <p className="text-slate-600">Casablanca, Maroc</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-100 rounded-3xl h-[400px] flex items-center justify-center relative overflow-hidden group">
              <img
                src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&h=600&fit=crop"
                alt="Map placeholder"
                className="w-full h-full object-cover opacity-50 grayscale group-hover:grayscale-0 transition-all duration-500"
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-white/90 backdrop-blur-sm px-6 py-3 rounded-full font-bold text-secondary shadow-lg">
                  {t.contact.location}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
