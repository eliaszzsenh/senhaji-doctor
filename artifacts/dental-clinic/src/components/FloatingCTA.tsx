import { Calendar } from "lucide-react";
import { Link } from "wouter";

export default function FloatingCTA() {
  return (
    <Link 
      href="/appointment"
      className="fixed bottom-6 left-6 z-40 flex items-center gap-2 px-5 py-3 rounded-full bg-primary text-white font-bold shadow-[0_10px_40px_-10px_rgba(249,115,22,0.6)] hover:bg-orange-600 hover:-translate-y-1 transition-all duration-300 md:hidden"
    >
      <Calendar className="w-5 h-5" />
      Reservar Cita
    </Link>
  );
}
