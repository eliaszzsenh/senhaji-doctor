import { motion } from "framer-motion";
import { CheckCircle2, GraduationCap, Globe, Stethoscope } from "lucide-react";
import { useLang } from "../i18n/LangContext";

const SKILLS = [
  "Odontologie générale et conservatrice",
  "Endodontie rotatoire",
  "Esthétique dentaire (Facettes, Blanchiment)",
  "Digital Smile Design (DSD)",
  "Prothèse dentaire (Fixe et Amovible)",
  "Chirurgie orale mineure et modérée",
  "Traitements au Laser à Diodes",
];

const TIMELINE = [
  {
    year: "1994 - 1999",
    title: "Licence en Odontologie",
    desc: "Université de Russie.",
  },
  {
    year: "1999",
    title: "Ouverture de clinique privée",
    desc: "Début de pratique privée à Casablanca, Maroc.",
  },
  {
    year: "2010",
    title: "Spécialisation Laser",
    desc: "Formation avancée en Laser à diodes dentaires.",
  },
  {
    year: "2015",
    title: "Certification DSD",
    desc: "Certification officielle en Digital Smile Design.",
  },
  {
    year: "Aujourd'hui",
    title: "Expansion européenne",
    desc: "Processus d'homologation du diplôme en Espagne, avec focus sur Valence.",
  },
];

export default function About() {
  const { t } = useLang();

  return (
    <main className="w-full pt-20">
      <section className="bg-secondary text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            Dr. Senhaji Jalil
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-white/80"
          >
            {t.about.title}
          </motion.p>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-16">
            <div className="lg:w-2/3">
              <h2 className="text-sm font-bold text-primary tracking-wider uppercase mb-2">
                {t.about.title}
              </h2>
              <h3 className="text-3xl font-bold text-slate-900 mb-6">
                {t.about.subtitle}
              </h3>
              <div className="space-y-4 text-lg text-slate-600">
                <p>{t.about.description1}</p>
                <p>{t.about.description2}</p>
                <p>{t.about.description3}</p>
              </div>
            </div>
            <div className="lg:w-1/3">
              <div className="bg-slate-100 rounded-3xl p-8">
                <div className="grid grid-cols-2 gap-6 text-center">
                  <div>
                    <div className="text-3xl font-bold text-primary">25+</div>
                    <div className="text-sm text-slate-600">ans expérience</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-primary">4</div>
                    <div className="text-sm text-slate-600">langues</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-primary">DSD</div>
                    <div className="text-sm text-slate-600">certifié</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-primary">5000+</div>
                    <div className="text-sm text-slate-600">patients</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-8">
            Compétences
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {SKILLS.map((skill, i) => (
              <div
                key={i}
                className="flex items-center gap-3 bg-white p-4 rounded-xl shadow-sm"
              >
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                <span className="text-slate-700">{skill}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-12 text-center">
            Parcours
          </h2>
          <div className="relative">
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-slate-200" />
            <div className="space-y-12">
              {TIMELINE.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className={`flex items-center gap-8 ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}
                >
                  <div
                    className={`flex-1 ${i % 2 === 0 ? "md:text-right" : "md:text-left"}`}
                  >
                    <div className="text-sm text-primary font-semibold mb-1">
                      {item.year}
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">
                      {item.title}
                    </h3>
                    <p className="text-slate-600">{item.desc}</p>
                  </div>
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center shrink-0 z-10">
                    <GraduationCap className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 hidden md:block" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
