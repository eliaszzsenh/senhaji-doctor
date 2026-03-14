import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Phone, Mail, MapPin, Clock, Loader2, CheckCircle } from "lucide-react";
import { useCreateAppointment } from "@workspace/api-client-react";

const SERVICES_OPTIONS = [
  "Odontología General",
  "Endodoncia Rotatoria",
  "Estética Dental (DSD)",
  "Prótesis Dental",
  "Cirugía Oral",
  "Láser Dental de Diodo"
];

const formSchema = z.object({
  name: z.string().min(2, "El nombre es obligatorio"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(6, "El teléfono es obligatorio"),
  service: z.string().min(1, "Selecciona un servicio"),
  preferred_date: z.string().min(1, "Selecciona una fecha"),
  preferred_time: z.enum(["Mañana", "Tarde"], { required_error: "Selecciona un horario" }),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function Appointment() {
  const [success, setSuccess] = useState(false);
  const { mutate: createAppointment, isPending } = useCreateAppointment();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = (data: FormData) => {
    createAppointment({ data }, {
      onSuccess: () => {
        setSuccess(true);
        reset();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  };

  return (
    <main className="w-full pt-20">
      <section className="bg-secondary text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Reserva tu Cita</h1>
          <p className="text-xl text-white/80">Da el primer paso hacia una sonrisa saludable.</p>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
            
            {/* Form */}
            <div className="lg:col-span-2">
              {success ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-green-50 border border-green-200 rounded-3xl p-12 text-center"
                >
                  <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10" />
                  </div>
                  <h3 className="text-3xl font-bold text-slate-900 mb-4">¡Solicitud Enviada!</h3>
                  <p className="text-lg text-slate-600 mb-8">
                    Hemos recibido tu solicitud de cita. Nuestro equipo se pondrá en contacto contigo a la brevedad para confirmar la fecha y hora exacta.
                  </p>
                  <button 
                    onClick={() => setSuccess(false)}
                    className="px-8 py-3 rounded-full bg-slate-900 text-white font-semibold hover:bg-primary transition-colors"
                  >
                    Hacer otra reserva
                  </button>
                </motion.div>
              ) : (
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 md:p-12">
                  <h2 className="text-2xl font-bold text-slate-900 mb-8">Información del Paciente</h2>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Nombre Completo *</label>
                        <input 
                          {...register("name")}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                          placeholder="Ej. Juan Pérez"
                        />
                        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Teléfono *</label>
                        <input 
                          {...register("phone")}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                          placeholder="+34 600 000 000"
                        />
                        {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Correo Electrónico *</label>
                      <input 
                        {...register("email")}
                        type="email"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                        placeholder="tu@email.com"
                      />
                      {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                    </div>

                    <div className="pt-6 border-t border-slate-100">
                      <h2 className="text-2xl font-bold text-slate-900 mb-6">Detalles de la Cita</h2>
                      
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">Servicio de Interés *</label>
                          <select 
                            {...register("service")}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all appearance-none"
                          >
                            <option value="">Selecciona un tratamiento</option>
                            {SERVICES_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                          </select>
                          {errors.service && <p className="text-red-500 text-sm mt-1">{errors.service.message}</p>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Fecha Preferida *</label>
                            <input 
                              {...register("preferred_date")}
                              type="date"
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                            />
                            {errors.preferred_date && <p className="text-red-500 text-sm mt-1">{errors.preferred_date.message}</p>}
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Horario Preferido *</label>
                            <select 
                              {...register("preferred_time")}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all appearance-none"
                            >
                              <option value="">Selecciona horario</option>
                              <option value="Mañana">Mañana (9:00 - 14:00)</option>
                              <option value="Tarde">Tarde (15:00 - 19:00)</option>
                            </select>
                            {errors.preferred_time && <p className="text-red-500 text-sm mt-1">{errors.preferred_time.message}</p>}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">Mensaje Adicional (Opcional)</label>
                          <textarea 
                            {...register("notes")}
                            rows={4}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none"
                            placeholder="Coméntanos si tienes alguna molestia específica o duda..."
                          />
                        </div>
                      </div>
                    </div>

                    <button 
                      type="submit"
                      disabled={isPending}
                      className="w-full py-4 rounded-xl bg-primary text-white font-bold text-lg hover:bg-orange-600 transition-colors shadow-lg shadow-primary/20 flex justify-center items-center gap-2"
                    >
                      {isPending && <Loader2 className="w-5 h-5 animate-spin" />}
                      Solicitar Cita
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Sidebar info */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm sticky top-32">
                <h3 className="text-xl font-bold text-slate-900 mb-6">Información Útil</h3>
                
                <div className="space-y-6 mb-8">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-accent text-secondary flex items-center justify-center shrink-0">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">Horario de Atención</h4>
                      <p className="text-slate-600 text-sm mt-1">Lunes a Viernes:<br/>09:00 - 19:00</p>
                      <p className="text-slate-600 text-sm mt-1">Sábados:<br/>09:00 - 14:00</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-accent text-secondary flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">Ubicación</h4>
                      <p className="text-slate-600 text-sm mt-1">Casablanca, Marruecos<br/><span className="italic text-xs">(Consultar para atención en Valencia)</span></p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-accent text-secondary flex items-center justify-center shrink-0">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">Urgencias</h4>
                      <p className="text-slate-600 text-sm mt-1">+212 707 15 15 14</p>
                    </div>
                  </div>
                </div>

                <div className="p-5 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-800">
                  <p className="font-semibold mb-1">Pacientes Internacionales</p>
                  <p>Si viajas desde Valencia u otra ciudad de Europa, contáctanos previamente para coordinar tu logística y estadía.</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
    </main>
  );
}
