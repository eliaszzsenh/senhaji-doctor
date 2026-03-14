import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, CheckCircle, MapPin, Phone, Mail, MessageCircle, Instagram, Facebook } from "lucide-react";
import { useCreateContactMessage } from "@workspace/api-client-react";

const formSchema = z.object({
  name: z.string().min(2, "El nombre es obligatorio"),
  email: z.string().email("Email inválido"),
  message: z.string().min(10, "El mensaje debe ser más largo"),
});

type FormData = z.infer<typeof formSchema>;

export default function Contact() {
  const [success, setSuccess] = useState(false);
  const { mutate: createMessage, isPending } = useCreateContactMessage();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = (data: FormData) => {
    createMessage({ data }, {
      onSuccess: () => {
        setSuccess(true);
        reset();
      }
    });
  };

  return (
    <main className="w-full pt-20">
      <section className="bg-secondary text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,white_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            Contacto
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-white/80"
          >
            Resolvemos tus dudas y planificamos tu tratamiento.
          </motion.p>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            
            {/* Contact Info */}
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-8">Ponte en contacto con nosotros</h2>
              
              <div className="space-y-8 mb-12">
                <div className="flex gap-6">
                  <div className="w-14 h-14 bg-accent rounded-full flex items-center justify-center text-secondary shrink-0">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-900 mb-1">Clínica Principal</h4>
                    <p className="text-slate-600 text-lg">Casablanca, Marruecos<br/><span className="text-sm">Proceso de colegiación activo en España (Valencia).</span></p>
                  </div>
                </div>
                
                <div className="flex gap-6">
                  <div className="w-14 h-14 bg-accent rounded-full flex items-center justify-center text-secondary shrink-0">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-900 mb-1">Teléfono Directo</h4>
                    <p className="text-slate-600 text-lg">+212 707 15 15 14</p>
                  </div>
                </div>
                
                <div className="flex gap-6">
                  <div className="w-14 h-14 bg-accent rounded-full flex items-center justify-center text-secondary shrink-0">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-900 mb-1">Correo Electrónico</h4>
                    <p className="text-slate-600 text-lg">cdsstomato@gmail.com</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-4">Síguenos en Redes Sociales</h4>
                <div className="flex gap-4">
                  <a href="#" className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-primary hover:text-white transition-all shadow-sm">
                    <Instagram className="w-5 h-5" />
                  </a>
                  <a href="#" className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-primary hover:text-white transition-all shadow-sm">
                    <Facebook className="w-5 h-5" />
                  </a>
                  <a href="#" className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-primary hover:text-white transition-all shadow-sm">
                    <MessageCircle className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-slate-100">
              {success ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                  <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle className="w-12 h-12" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">¡Mensaje Enviado!</h3>
                  <p className="text-slate-600 mb-8">Gracias por contactarnos. Te responderemos lo más pronto posible.</p>
                  <button 
                    onClick={() => setSuccess(false)}
                    className="px-8 py-3 rounded-full bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 transition-colors"
                  >
                    Enviar otro mensaje
                  </button>
                </div>
              ) : (
                <>
                  <h3 className="text-2xl font-bold text-slate-900 mb-8">Envíanos tu consulta</h3>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Tu Nombre</label>
                      <input 
                        {...register("name")}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                        placeholder="Escribe tu nombre"
                      />
                      {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Tu Email</label>
                      <input 
                        {...register("email")}
                        type="email"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                        placeholder="tu@email.com"
                      />
                      {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Mensaje</label>
                      <textarea 
                        {...register("message")}
                        rows={5}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none"
                        placeholder="¿En qué podemos ayudarte?"
                      />
                      {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message.message}</p>}
                    </div>
                    
                    <button 
                      type="submit"
                      disabled={isPending}
                      className="w-full py-4 rounded-xl bg-primary text-white font-bold text-lg hover:bg-orange-600 transition-colors shadow-lg shadow-primary/20 flex justify-center items-center gap-2"
                    >
                      {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                      Enviar Mensaje
                    </button>
                  </form>
                </>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="h-[500px] w-full bg-slate-200 relative group overflow-hidden">
        {/* Unsplash Map Placeholder */}
        {/* Modern clean map aerial abstraction */}
        <img 
          src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1920&h=800&fit=crop" 
          alt="Map" 
          className="w-full h-full object-cover opacity-70 grayscale group-hover:grayscale-0 transition-all duration-700"
        />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-white px-8 py-4 rounded-2xl font-bold text-slate-900 shadow-2xl flex items-center gap-3">
            <MapPin className="text-primary w-6 h-6" />
            Casablanca, Marruecos
          </div>
        </div>
      </section>
    </main>
  );
}
