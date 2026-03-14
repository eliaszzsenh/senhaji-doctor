import { Link } from "wouter";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] w-full flex items-center justify-center bg-gray-50 pt-20">
      <div className="text-center bg-white p-12 rounded-3xl shadow-xl border border-slate-100 max-w-lg mx-4">
        <AlertCircle className="w-20 h-20 text-primary mx-auto mb-6 opacity-80" />
        <h1 className="text-4xl font-bold text-slate-900 mb-4">Página no encontrada</h1>
        <p className="text-lg text-slate-600 mb-8">
          Lo sentimos, la página que buscas no existe o ha sido movida.
        </p>
        <Link href="/">
          <span className="inline-block px-8 py-3 rounded-full bg-primary text-white font-semibold hover:bg-orange-600 transition-colors shadow-lg shadow-primary/20">
            Volver al inicio
          </span>
        </Link>
      </div>
    </div>
  );
}
