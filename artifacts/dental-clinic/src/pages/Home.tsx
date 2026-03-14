import { motion } from "framer-motion";
import { Link } from "wouter";
import { Calendar, ArrowRight, ShieldCheck, Globe2, Zap, Award, Star, Phone, Mail, MapPin } from "lucide-react";

const SERVICES = [
  { id: 1, title: "Odontología General", desc: "Cuidado preventivo y restaurador para una salud bucal óptima." },
  { id: 2, title: "Endodoncia Rotatoria", desc: "Tratamiento de conducto indoloro con tecnología rotatoria de punta." },
  { id: 3, title: "Estética Dental (DSD)", desc: "Diseño de Sonrisa Digital, carillas y blanqueamiento profesional." },
  { id: 4, title: "Prótesis Dental", desc: "Rehabilitación oral completa con prótesis fijas y removibles." },
  { id: 5, title: "Cirugía Oral", desc: "Extracciones seguras, incluyendo muelas del juicio y cirugías menores." },
  { id: 6, title: "Láser Dental de Diodo", desc: "Tratamientos conservadores y periodontales mínimamente invasivos." },
];

const TESTIMONIALS = [
  { name: "M. García", text: "Excelente profesional. El tratamiento con láser fue indoloro y los resultados de mis carillas son espectaculares. Lo recomiendo ampliamente." },
  { name: "C. Ruiz", text: "Viajé desde Valencia para mi tratamiento. La atención en 5 idiomas y la calidad del servicio valieron totalmente la pena." },
  { name: "A. Martínez", text: "Tenía pánico al dentista, pero el Dr. Senhaji y su tecnología me dieron muchísima confianza. Una clínica de primer nivel." }
];

export default function Home() {
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
                Excelencia Odontológica
              </span>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                Tu sonrisa, <br/><span className="text-primary">nuestra pasión.</span>
              </h1>
              <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl leading-relaxed">
                Dr. Senhaji Jalil — Odontólogo Especialista con 25 años de experiencia brindando atención de clase mundial con tecnología de vanguardia.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-16">
                <Link href="/appointment" className="px-8 py-4 rounded-full bg-primary text-white font-bold text-lg shadow-lg shadow-primary/30 hover:shadow-xl hover:-translate-y-1 transition-all text-center flex justify-center items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Reservar Cita
                </Link>
                <Link href="/about" className="px-8 py-4 rounded-full bg-white/10 text-white font-bold text-lg backdrop-blur-sm border border-white/20 hover:bg-white/20 hover:-translate-y-1 transition-all text-center">
                  Conocer al Doctor
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8 border-t border-white/10">
                <div className="flex items-center gap-2 text-white/90">
                  <ShieldCheck className="w-5 h-5 text-accent" />
                  <span className="text-sm font-medium">25 años exp.</span>
                </div>
                <div className="flex items-center gap-2 text-white/90">
                  <Globe2 className="w-5 h-5 text-accent" />
                  <span className="text-sm font-medium">Atención Int.</span>
                </div>
                <div className="flex items-center gap-2 text-white/90">
                  <Zap className="w-5 h-5 text-accent" />
                  <span className="text-sm font-medium">Láser Dental</span>
                </div>
                <div className="flex items-center gap-2 text-white/90">
                  <Award className="w-5 h-5 text-accent" />
                  <span className="text-sm font-medium">DSD Certificado</span>
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
            <h2 className="text-sm font-bold text-primary tracking-wider uppercase mb-2">ESPECIALIDADES</h2>
            <h3 className="text-3xl md:text-4xl font-bold text-slate-900">Nuestros Tratamientos</h3>
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
                <h4 className="text-xl font-bold text-slate-900 mb-3">{s.title}</h4>
                <p className="text-slate-600 mb-6">{s.desc}</p>
                <Link href="/services" className="inline-flex items-center gap-2 text-primary font-semibold group-hover:gap-3 transition-all">
                  Ver más <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-secondary text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-5 pointer-events-none">
          <svg className="absolute w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-white/10">
            <div>
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">25+</div>
              <div className="text-white/80 font-medium">Años Experiencia</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">5</div>
              <div className="text-white/80 font-medium">Idiomas Hablados</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">DSD</div>
              <div className="text-white/80 font-medium">Certificado Oficial</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">Top</div>
              <div className="text-white/80 font-medium">Tecnología Láser</div>
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
              <h2 className="text-sm font-bold text-primary tracking-wider uppercase mb-2">SOBRE EL DOCTOR</h2>
              <h3 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">Uniendo experiencia internacional y tecnología avanzada</h3>
              <div className="space-y-4 text-lg text-slate-600 mb-8">
                <p>
                  El Dr. Senhaji Jalil es un odontólogo especialista con más de dos décadas de experiencia dirigiendo su clínica privada en Casablanca.
                </p>
                <p>
                  Licenciado por la Universidad de Rusia y certificado en Digital Smile Design (DSD) y uso de Láser de Diodo, su enfoque se centra en tratamientos mínimamente invasivos y estéticamente perfectos.
                </p>
                <p>
                  Atiende a pacientes de toda Europa, con un interés especial en la comunidad de Valencia, España.
                </p>
              </div>
              <Link href="/about" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-secondary text-white font-semibold hover:bg-blue-800 transition-colors">
                Conocer más sobre el doctor <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Lo que dicen nuestros pacientes</h3>
            <p className="text-slate-600 max-w-2xl mx-auto">Basado en años de experiencia y cientos de sonrisas transformadas internacionalmente.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 relative">
                <div className="flex text-amber-400 mb-4">
                  {[...Array(5)].map((_, j) => <Star key={j} className="w-5 h-5 fill-current" />)}
                </div>
                <p className="text-slate-700 italic mb-6">"{t.text}"</p>
                <p className="font-bold text-slate-900">{t.name}</p>
                <span className="text-sm text-slate-500">Paciente Internacional</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-primary py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">¿Listo para tu consulta?</h2>
          <p className="text-white/90 text-lg mb-8">Reserva tu cita en minutos y da el primer paso hacia la sonrisa que mereces.</p>
          <button 
            onClick={() => document.querySelector<HTMLButtonElement>('.fixed.bottom-6.right-6')?.click()}
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary font-bold rounded-full hover:shadow-xl hover:scale-105 transition-all text-lg"
          >
            Hablar con nuestro asistente
          </button>
        </div>
      </section>

      {/* Contact Preview */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div>
              <h2 className="text-sm font-bold text-primary tracking-wider uppercase mb-2">CONTACTO</h2>
              <h3 className="text-3xl font-bold text-slate-900 mb-8">Estamos aquí para ayudarte</h3>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center text-secondary shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Teléfono</h4>
                    <p className="text-slate-600">+212 707 15 15 14</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center text-secondary shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Email</h4>
                    <p className="text-slate-600">cdsstomato@gmail.com</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center text-secondary shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Ubicación Principal</h4>
                    <p className="text-slate-600">Casablanca, Marruecos<br/>Atención especial a pacientes de Valencia.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-100 rounded-3xl h-[400px] flex items-center justify-center relative overflow-hidden group">
               {/* Unsplash Map Placeholder */}
               {/* aerial view of city map abstract */}
               <img 
                 src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&h=600&fit=crop" 
                 alt="Map placeholder" 
                 className="w-full h-full object-cover opacity-50 grayscale group-hover:grayscale-0 transition-all duration-500"
               />
               <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 <div className="bg-white/90 backdrop-blur-sm px-6 py-3 rounded-full font-bold text-secondary shadow-lg">
                   Mapa de Ubicación
                 </div>
               </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
