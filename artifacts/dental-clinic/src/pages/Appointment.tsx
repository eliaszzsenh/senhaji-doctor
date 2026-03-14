import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Phone, Mail, MapPin, Clock, Loader2, CheckCircle } from "lucide-react";
import { useCreateAppointment } from "@workspace/api-client-react";
import { useLang } from "../i18n/LangContext";

const SERVICES_OPTIONS = [
  { key: "general", value: "general" },
  { key: "endodontics", value: "endodontics" },
  { key: "aesthetic", value: "aesthetic" },
  { key: "prosthesis", value: "prosthesis" },
  { key: "surgery", value: "cirugia" },
  { key: "laser", value: "laser" },
];

const formSchema = z.object({
  name: z.string().min(2, "Le nom est obligatoire"),
  email: z.string().email("Email invalide"),
  phone: z.string().min(6, "Le téléphone est obligatoire"),
  service: z.string().min(1, "Sélectionnez un service"),
  preferred_date: z.string().min(1, "Sélectionnez une date"),
  preferred_time: z.enum(["matin", "apres-midi"], {
    required_error: "Sélectionnez un horaire",
  }),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function Appointment() {
  const { t } = useLang();
  const [success, setSuccess] = useState(false);
  const { mutate: createAppointment, isPending } = useCreateAppointment();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = (data: FormData) => {
    createAppointment(
      { data: { ...data, lang: "fr" } },
      {
        onSuccess: () => {
          setSuccess(true);
          reset();
          window.scrollTo({ top: 0, behavior: "smooth" });
        },
      },
    );
  };

  const getServiceLabel = (key: string) => {
    const labels: Record<string, string> = {
      general: t.services.general,
      endodontics: t.services.endodontics,
      aesthetic: t.services.aesthetic,
      prosthesis: t.services.prosthesis,
      surgery: t.services.surgery,
      laser: t.services.laser,
    };
    return labels[key] || key;
  };

  if (success) {
    return (
      <main className="w-full pt-20">
        <section className="py-20 bg-white">
          <div className="max-w-2xl mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-slate-900 mb-4">
                {t.appointment.success}
              </h1>
              <p className="text-slate-600 mb-8">
                Nous vous contacterons bientôt pour confirmer votre rendez-vous.
              </p>
              <button
                onClick={() => setSuccess(false)}
                className="px-6 py-3 bg-primary text-white rounded-full font-semibold hover:bg-orange-600 transition-colors"
              >
                Nouveau rendez-vous
              </button>
            </motion.div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="w-full pt-20">
      <section className="bg-secondary text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-4">{t.appointment.title}</h1>
          <p className="text-xl text-white/80">{t.appointment.subtitle}</p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    {t.appointment.form_name}
                  </label>
                  <input
                    {...register("name")}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      {t.appointment.form_email}
                    </label>
                    <input
                      {...register("email")}
                      type="email"
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      {t.appointment.form_phone}
                    </label>
                    <input
                      {...register("phone")}
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.phone.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    {t.appointment.form_service}
                  </label>
                  <select
                    {...register("service")}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  >
                    <option value="">Sélectionner un service</option>
                    {SERVICES_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {getServiceLabel(opt.key)}
                      </option>
                    ))}
                  </select>
                  {errors.service && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.service.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      {t.appointment.form_date}
                    </label>
                    <input
                      {...register("preferred_date")}
                      type="date"
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                    {errors.preferred_date && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.preferred_date.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      {t.appointment.form_time}
                    </label>
                    <select
                      {...register("preferred_time")}
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                    >
                      <option value="">Sélectionner</option>
                      <option value="matin">{t.appointment.time_matin}</option>
                      <option value="apres-midi">
                        {t.appointment.time_apresmidi}
                      </option>
                    </select>
                    {errors.preferred_time && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.preferred_time.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    {t.appointment.form_notes}
                  </label>
                  <textarea
                    {...register("notes")}
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full py-4 bg-primary text-white font-bold rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : null}
                  {t.appointment.submit}
                </button>
              </form>
            </div>

            <div className="space-y-6">
              <div className="bg-slate-50 rounded-2xl p-6">
                <h3 className="font-bold text-slate-900 mb-4">
                  {t.footer.schedule}
                </h3>
                <div className="space-y-3 text-slate-600">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-primary shrink-0" />
                    <span>{t.footer.monday_friday}: 9h00 - 19h00</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-primary shrink-0" />
                    <span>{t.footer.saturday}: 9h00 - 14h00</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl p-6">
                <h3 className="font-bold text-slate-900 mb-4">
                  {t.contact.title}
                </h3>
                <div className="space-y-3 text-slate-600">
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-primary shrink-0" />
                    <span>+212 707 15 15 14</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-primary shrink-0" />
                    <span>cdsstomato@gmail.com</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-primary shrink-0" />
                    <span>Casablanca, Maroc</span>
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
