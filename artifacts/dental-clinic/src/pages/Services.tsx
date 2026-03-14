import { motion } from "framer-motion";
import { Link } from "wouter";
import { Calendar, Shield, Activity, Sparkles, Droplet, Wrench, Zap } from "lucide-react";

const SERVICES_DETAIL = [
  {
    icon: Shield,
    title: "Odontología General & Conservadora",
    desc: "El pilar fundamental para una sonrisa sana a largo plazo. Nos enfocamos en la prevención y el tratamiento temprano de afecciones dentales.",
    procedure: "Incluye revisiones periódicas completas, limpiezas profesionales, prevención de caries y empastes estéticos con resina compuesta (composites) que se mimetizan con el color natural del diente.",
  },
  {
    icon: Activity,
    title: "Endodoncia Rotatoria",
    desc: "Tratamiento de conductos moderno y prácticamente indoloro que salva dientes que de otra manera tendrían que ser extraídos.",
    procedure: "Utilizamos instrumentación mecanizada rotatoria que reduce significativamente el tiempo de la intervención y mejora la precisión en la limpieza y sellado de los conductos radiculares, asegurando un postoperatorio muy confortable.",
  },
  {
    icon: Sparkles,
    title: "Estética Dental & DSD",
    desc: "Armonizamos la estética de tu sonrisa considerando tus rasgos faciales mediante Digital Smile Design (DSD).",
    procedure: "A través del DSD, planificamos por ordenador el resultado final antes de tocar el diente. Ofrecemos carillas de porcelana, reconstrucciones estéticas con composite de alta gama y blanqueamiento dental profesional con resultados inmediatos.",
  },
  {
    icon: Wrench,
    title: "Prótesis Dental",
    desc: "Recupera la función masticatoria, la fonética y la estética mediante rehabilitaciones protésicas de alta calidad.",
    procedure: "Realizamos prótesis fijas (coronas y puentes sin metal, de circonio o disilicato) y prótesis removibles de última generación, logrando un ajuste perfecto y una apariencia completamente natural.",
  },
  {
    icon: Droplet,
    title: "Cirugía Oral",
    desc: "Procedimientos quirúrgicos seguros y mínimamente invasivos realizados en un entorno clínico estrictamente controlado.",
    procedure: "Especialistas en extracción de terceros molares (muelas del juicio) erupcionadas o incluidas, exodoncias complejas, regularización de rebordes alveolares y otras cirugías orales menores y moderadas.",
  },
  {
    icon: Zap,
    title: "Láser Dental de Diodo",
    desc: "La tecnología más avanzada para tratamientos odontológicos con menor sangrado, menos dolor y recuperación más rápida.",
    procedure: "El láser se utiliza para cirugías de tejidos blandos (frenectomías, gingivectomías), descontaminación en tratamientos periodontales y endodónticos, tratamiento de aftas o herpes, y para acelerar el blanqueamiento dental de forma segura.",
  }
];

export default function Services() {
  return (
    <main className="w-full pt-20">
      <section className="bg-secondary text-white py-20 relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10 w-96 h-96 translate-x-1/3 -translate-y-1/3">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
            <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z" />
          </svg>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold mb-6"
          >
            Tratamientos & Servicios
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-white/80 max-w-2xl mx-auto"
          >
            Odontología de vanguardia respaldada por 25 años de excelencia clínica.
          </motion.p>
        </div>
      </section>

      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {SERVICES_DETAIL.map((service, i) => {
              const Icon = service.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-slate-100 hover:shadow-xl transition-shadow flex flex-col h-full"
                >
                  <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center text-secondary mb-8">
                    <Icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">{service.title}</h3>
                  <p className="text-lg text-slate-700 font-medium mb-4">{service.desc}</p>
                  <div className="bg-slate-50 rounded-xl p-5 mb-8 flex-1 border border-slate-100">
                    <h4 className="font-semibold text-slate-900 mb-2 text-sm uppercase tracking-wide">¿Qué esperar?</h4>
                    <p className="text-slate-600 leading-relaxed">{service.procedure}</p>
                  </div>
                  <Link 
                    href="/appointment" 
                    className="inline-flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-slate-900 text-white font-semibold hover:bg-primary transition-colors"
                  >
                    <Calendar className="w-5 h-5" />
                    Reservar consulta
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
