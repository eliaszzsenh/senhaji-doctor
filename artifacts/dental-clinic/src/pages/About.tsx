import { motion } from "framer-motion";
import { CheckCircle2, GraduationCap, Globe, Stethoscope } from "lucide-react";

const SKILLS = [
  "Odontología General y Conservadora",
  "Endodoncia Rotatoria",
  "Estética Dental (Carillas, Blanqueamiento)",
  "Digital Smile Design (DSD)",
  "Prótesis Dental (Fija y Removible)",
  "Cirugía Oral Menor y Moderada",
  "Tratamientos con Láser de Diodo"
];

const TIMELINE = [
  { year: "1994 - 1999", title: "Licenciatura en Odontología", desc: "Universidad de Rusia." },
  { year: "1999", title: "Apertura de Clínica Privada", desc: "Inicio de práctica privada en Casablanca, Marruecos." },
  { year: "2010", title: "Especialización Láser", desc: "Formación avanzada en Láser de Diodo dental." },
  { year: "2015", title: "Certificación DSD", desc: "Certificación oficial en Digital Smile Design." },
  { year: "Actualidad", title: "Expansión Europea", desc: "Proceso de homologación de título en España, con foco en Valencia." }
];

export default function About() {
  return (
    <main className="w-full pt-20">
      {/* Hero */}
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
            Odontólogo Especialista
          </motion.p>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-16">
            {/* Bio */}
            <div className="lg:w-2/3">
              <h2 className="text-3xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                <Stethoscope className="text-primary w-8 h-8" />
                Perfil Profesional
              </h2>
              <div className="prose prose-lg text-slate-600 max-w-none mb-12">
                <p>
                  Con <strong>25 años de experiencia</strong> exclusiva, el Dr. Senhaji Jalil ha dedicado su carrera a perfeccionar el arte y la ciencia de la odontología. Desde la apertura de su clínica privada en Casablanca en 1999, ha transformado miles de sonrisas, combinando técnicas conservadoras con la última tecnología disponible.
                </p>
                <p>
                  Su búsqueda constante de la excelencia lo llevó a especializarse en <strong>Láser de Diodo en 2010</strong> y obtener la prestigiosa certificación en <strong>Digital Smile Design (DSD) en 2015</strong>, permitiéndole ofrecer tratamientos estéticos predecibles y de alta precisión.
                </p>
                <p>
                  Actualmente, el Dr. Senhaji se encuentra en proceso de homologación de su título en España. Su gran motivación es integrarse activamente en una clínica en <strong>Valencia</strong>, ciudad con la que tiene un fuerte vínculo personal y familiar, ya que sus hijos estudian allí.
                </p>
              </div>

              <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                <CheckCircle2 className="text-primary w-6 h-6" />
                Áreas de Especialidad
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
                {SKILLS.map((skill, i) => (
                  <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                    <span className="font-medium text-slate-700">{skill}</span>
                  </div>
                ))}
              </div>

              <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                <Globe className="text-primary w-6 h-6" />
                Idiomas
              </h3>
              <div className="flex flex-wrap gap-4">
                <div className="px-5 py-3 rounded-full bg-accent/30 text-secondary font-semibold border border-accent">🇲🇦 Árabe (Nativo)</div>
                <div className="px-5 py-3 rounded-full bg-accent/30 text-secondary font-semibold border border-accent">🇪🇸 Español (Profesional)</div>
                <div className="px-5 py-3 rounded-full bg-accent/30 text-secondary font-semibold border border-accent">🇫🇷 Francés (Avanzado)</div>
                <div className="px-5 py-3 rounded-full bg-accent/30 text-secondary font-semibold border border-accent">🇬🇧 Inglés (Avanzado)</div>
                <div className="px-5 py-3 rounded-full bg-accent/30 text-secondary font-semibold border border-accent">🇷🇺 Ruso (Avanzado)</div>
              </div>
            </div>

            {/* Sidebar / Timeline */}
            <div className="lg:w-1/3">
              <div className="sticky top-32">
                <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100">
                  <h3 className="text-xl font-bold text-slate-900 mb-8 flex items-center gap-3">
                    <GraduationCap className="text-primary w-6 h-6" />
                    Trayectoria
                  </h3>
                  
                  <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                    {TIMELINE.map((item, i) => (
                      <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-primary text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 absolute left-0 md:left-1/2 -translate-x-1/2" />
                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-white p-4 rounded-xl shadow-sm border border-slate-100 ml-12 md:ml-0">
                          <span className="text-sm font-bold text-primary mb-1 block">{item.year}</span>
                          <h4 className="font-bold text-slate-900 mb-1">{item.title}</h4>
                          <p className="text-sm text-slate-600">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
