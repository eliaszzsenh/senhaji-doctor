import { lazy, Suspense, Component, ReactNode } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

// Pages - Lazy loaded
const Home = lazy(() => import("./pages/Home"));
const About = lazy(() => import("./pages/About"));
const Services = lazy(() => import("./pages/Services"));
const Appointment = lazy(() => import("./pages/Appointment"));
const Contact = lazy(() => import("./pages/Contact"));
const NotFound = lazy(() => import("./pages/not-found"));

// Admin Pages - Lazy loaded
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));

// Layout
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ChatWidget from "./components/ChatWidget";
import WhatsAppButton from "./components/WhatsAppButton";
import LanguagePicker from "./components/LanguagePicker";
import CookieBanner from "./components/CookieBanner";

// i18n
import { LangProvider, useLang } from "./i18n/LangContext";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const PageLoader = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error: string }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: "" };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-screen flex-col gap-4">
          <h1 className="text-2xl font-bold text-red-600">
            Une erreur est survenue
          </h1>
          <p className="text-gray-600">{this.state.error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg"
          >
            Recharger la page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function PublicRouter() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-grow">
        <Suspense fallback={<PageLoader />}>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/about" component={About} />
            <Route path="/services" component={Services} />
            <Route path="/appointment" component={Appointment} />
            <Route path="/contact" component={Contact} />
            <Route component={NotFound} />
          </Switch>
        </Suspense>
      </div>
      <Footer />
      <ChatWidget />
      <WhatsAppButton />
    </div>
  );
}

function AppContent() {
  const { lang, setLang } = useLang();

  if (!lang) {
    return <LanguagePicker onSelect={setLang} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Suspense fallback={<PageLoader />}>
            <Switch>
              <Route path="/admin/login" component={AdminLogin} />
              <Route path="/admin" component={AdminDashboard} />
              <Route component={PublicRouter} />
            </Switch>
          </Suspense>
        </WouterRouter>
        <Toaster />
        <CookieBanner />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <LangProvider>
        <AppContent />
      </LangProvider>
    </ErrorBoundary>
  );
}

export default App;
