import { motion } from "framer-motion";
import { Link } from "wouter";
import {
  Calendar,
  Shield,
  Activity,
  Sparkles,
  Droplet,
  Wrench,
  Zap,
} from "lucide-react";
import { useLang } from "../i18n/LangContext";

const SERVICES_DETAIL = [
  {
    icon: Shield,
    key: "general",
    desc: "Le pilier fondamental pour un sourire sain à long terme. Nous nous concentrons sur la prévention et le traitement précoce des affections dentaires.",
    procedure:
      "Inclut des revisiones périodiques complètes, nettoyages professionnels, prévention des caries et plombages esthétiques en résine composite.",
  },
  {
    icon: Activity,
    key: "endodontics",
    desc: "Traitement de canaux moderne et pratiquement indolore qui sauve les dents qui autrement devraient être extraites.",
    procedure:
      "Nous utilisons l'instrumentation mécanisée rotatoire qui réduit significativement le temps d'intervention et améliore la précision.",
  },
  {
    icon: Sparkles,
    key: "aesthetic",
    desc: "Harmonisons l'esthétique de votre sourire en，考虑ant vos traits faciaux via Digital Smile Design (DSD).",
    procedure:
      "À travers le DSD, nous planifions le résultat final avant de toucher la dent. Nous proposons facettes en porcelaine et blanchiment professionnel.",
  },
  {
    icon: Wrench,
    key: "prosthesis",
    desc: "Récupérez la fonction masticatoire, la phonétique et l'esthétique via des réhabilitations prothétiques de haute qualité.",
    procedure:
      "Nous réalisons des prothèses fixes (couronnes et ponts sans métal, en zircon ou disilicate) et prothèses removibles de dernière génération.",
  },
  {
    icon: Droplet,
    key: "surgery",
    desc: "Procédures chirurgicales sûres et minimement invasives réalisées dans un environnement clinique strictement contrôlé.",
    procedure:
      "Spécialistes dans l'extraction des troisièmes molaires (dents de sagesse) erupcionnées ou incluses, exodonties complexes et autres chirurgies orales.",
  },
  {
    icon: Zap,
    key: "laser",
    desc: "La technologie la plus avancée pour les traitements odontologiques avec moins de saignement, moins de douleur et récupération plus rapide.",
    procedure:
      "Le laser est utilisé pour les chirurgies des tissus mous, la descontamination dans les traitements parodontaux et endodontiques.",
  },
];

export default function Services() {
  const { t } = useLang();

  const getTitle = (key: string) => {
    const titles: Record<string, string> = {
      general: t.services.general,
      endodontics: t.services.endodontics,
      aesthetic: t.services.aesthetic,
      prosthesis: t.services.prosthesis,
      surgery: t.services.surgery,
      laser: t.services.laser,
    };
    return titles[key] || key;
  };

  return (
    <main className="w-full pt-20">
      <section className="bg-secondary text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            {t.services.title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-white/80"
          >
            {t.hero.subtitle}
          </motion.p>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12">
            {SERVICES_DETAIL.map((service, i) => (
              <motion.div
                key={service.key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0">
                    <service.icon className="w-8 h-8 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-slate-900 mb-4">
                      {getTitle(service.key)}
                    </h3>
                    <p className="text-lg text-slate-600 mb-4">
                      {service.desc}
                    </p>
                    <div className="bg-slate-50 rounded-xl p-4">
                      <h4 className="font-semibold text-slate-900 mb-2">
                        Procédure
                      </h4>
                      <p className="text-slate-600">{service.procedure}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-primary py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            {t.hero.cta_primary}
          </h2>
          <p className="text-white/90 text-lg mb-8">
            Prenez rendez-vous pour une consultation personnalisée.
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
    </main>
  );
}
