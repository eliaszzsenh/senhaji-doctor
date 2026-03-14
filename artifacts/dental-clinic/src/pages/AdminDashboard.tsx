import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import {
  Calendar as CalendarIcon,
  List,
  LogOut,
  Search,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface Appointment {
  id: number;
  name: string;
  email: string;
  phone: string;
  service: string;
  preferred_date: string;
  preferred_time: string;
  notes: string | null;
  status: string;
  lang: string;
  created_at: string;
}

interface Stats {
  total: number;
  pending: number;
  confirmed: number;
  cancelled: number;
  thisWeek: number;
}

const SERVICE_TRANSLATIONS: Record<string, string> = {
  general: "Odontologie générale",
  endodontics: "Endodontie rotatoire",
  aesthetic: "Esthétique dentaire",
  prosthesis: "Prothèse dentaire",
  surgery: "Chirurgie orale",
  laser: "Laser dentaire",
  endodoncia: "Endodontie rotatoire",
  estetica: "Esthétique dentaire",
  protesis: "Prothèse dentaire",
  cirugia: "Chirurgie orale",
};

const MONTHS = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [stats, setStats] = useState<Stats>({
    total: 0,
    pending: 0,
    confirmed: 0,
    cancelled: 0,
    thisWeek: 0,
  });
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"calendar" | "list">("calendar");
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const token = localStorage.getItem("admin_token");

  useEffect(() => {
    if (!token) {
      setLocation("/admin/login");
      return;
    }
    fetchData();
  }, [token]);

  const fetchData = async () => {
    try {
      const [statsRes, apptsRes] = await Promise.all([
        fetch("/api/admin/stats", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/admin/appointments", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (apptsRes.ok) setAppointments(await apptsRes.json());
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    setLocation("/admin/login");
  };

  const handleStatusChange = async (id: number, status: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/appointments/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        setAppointments(
          appointments.map((a) => (a.id === id ? { ...a, status } : a)),
        );
        setSelectedAppointment(null);
        fetchData();
      }
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: (Date | null)[] = [];

    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const getAppointmentsForDay = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    return appointments.filter((a) => a.preferred_date === dateStr);
  };

  const filteredAppointments = appointments
    .filter((a) => filter === "all" || a.status === filter)
    .filter(
      (a) =>
        search === "" ||
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.email.toLowerCase().includes(search.toLowerCase()),
    )
    .sort(
      (a, b) =>
        new Date(b.preferred_date).getTime() -
        new Date(a.preferred_date).getTime(),
    );

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: "bg-orange-100 text-orange-700",
      confirmed: "bg-green-100 text-green-700",
      cancelled: "bg-gray-100 text-gray-700",
    };
    const labels = {
      pending: "En attente",
      confirmed: "Confirmé",
      cancelled: "Annulé",
    };
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || styles.pending}`}
      >
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  const getServiceName = (service: string) => {
    return SERVICE_TRANSLATIONS[service] || service;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-500">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-slate-900 to-slate-800 text-white px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-orange-400 rounded-xl flex items-center justify-center">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="w-5 h-5 text-white"
              >
                <path d="M12 2C8 2 6 5 6 8c0 3 2 4 2 7 0 2-1 4-1 5 1 0 3-1 4-3 1 2 3 3 4 3 0-1-1-3-1-5 0-3 2-4 2-7 0-3-2-6-6-6z" />
              </svg>
            </div>
            <span className="font-bold text-lg">
              Centre Dentaire Senhaji — Administration
            </span>
          </div>
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="text-white hover:bg-white/10"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Se déconnecter
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
            <div className="text-2xl font-bold text-blue-600">
              {stats.total}
            </div>
            <div className="text-sm text-slate-500">Total rendez-vous</div>
          </div>
          <button
            onClick={() => setFilter("pending")}
            className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 text-left hover:shadow-md transition-shadow"
          >
            <div className="text-2xl font-bold text-orange-500">
              {stats.pending}
            </div>
            <div className="text-sm text-slate-500">En attente</div>
          </button>
          <button
            onClick={() => setFilter("confirmed")}
            className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 text-left hover:shadow-md transition-shadow"
          >
            <div className="text-2xl font-bold text-green-500">
              {stats.confirmed}
            </div>
            <div className="text-sm text-slate-500">Confirmés</div>
          </button>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
            <div className="text-2xl font-bold text-purple-500">
              {stats.thisWeek}
            </div>
            <div className="text-sm text-slate-500">Cette semaine</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("calendar")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === "calendar"
                ? "bg-primary text-white"
                : "bg-white text-slate-600 hover:bg-slate-100"
            }`}
          >
            <CalendarIcon className="w-4 h-4 inline-block mr-2" />
            Calendrier
          </button>
          <button
            onClick={() => setActiveTab("list")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === "list"
                ? "bg-primary text-white"
                : "bg-white text-slate-600 hover:bg-slate-100"
            }`}
          >
            <List className="w-4 h-4 inline-block mr-2" />
            Liste
          </button>
        </div>

        {activeTab === "calendar" && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <button
                onClick={() =>
                  setCurrentMonth(
                    new Date(
                      currentMonth.getFullYear(),
                      currentMonth.getMonth() - 1,
                    ),
                  )
                }
                className="p-2 hover:bg-slate-100 rounded-lg"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h3 className="font-semibold text-lg">
                {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </h3>
              <button
                onClick={() =>
                  setCurrentMonth(
                    new Date(
                      currentMonth.getFullYear(),
                      currentMonth.getMonth() + 1,
                    ),
                  )
                }
                className="p-2 hover:bg-slate-100 rounded-lg"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-7 gap-px bg-slate-200">
              {["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"].map((day) => (
                <div
                  key={day}
                  className="bg-slate-50 p-2 text-center text-sm font-medium text-slate-500"
                >
                  {day}
                </div>
              ))}
              {getDaysInMonth(currentMonth).map((day, idx) => {
                if (!day) {
                  return (
                    <div key={idx} className="bg-white p-4 min-h-[100px]" />
                  );
                }
                const dayAppointments = getAppointmentsForDay(day);
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedDay(day)}
                    className="bg-white p-2 min-h-[100px] hover:bg-slate-50 text-left"
                  >
                    <div className="text-sm font-medium mb-1">
                      {day.getDate()}
                    </div>
                    <div className="space-y-1">
                      {dayAppointments.slice(0, 2).map((a, i) => (
                        <div
                          key={i}
                          className={`text-xs px-1 py-0.5 rounded ${
                            a.status === "pending"
                              ? "bg-orange-100 text-orange-700"
                              : a.status === "confirmed"
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {a.name.split(" ")[0]}
                        </div>
                      ))}
                      {dayAppointments.length > 2 && (
                        <div className="text-xs text-slate-400">
                          +{dayAppointments.length - 2}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === "list" && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-100">
            <div className="p-4 border-b flex gap-4 items-center">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Rechercher par nom ou email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                {["all", "pending", "confirmed", "cancelled"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      filter === f
                        ? "bg-primary text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {f === "all"
                      ? "Tous"
                      : f === "pending"
                        ? "En attente"
                        : f === "confirmed"
                          ? "Confirmés"
                          : "Annulés"}
                  </button>
                ))}
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Créneau</TableHead>
                  <TableHead>Téléphone</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAppointments.slice(0, 20).map((appt) => (
                  <TableRow key={appt.id}>
                    <TableCell className="font-medium">
                      {appt.preferred_date}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{appt.name}</div>
                      <div className="text-sm text-slate-500">{appt.email}</div>
                    </TableCell>
                    <TableCell>{getServiceName(appt.service)}</TableCell>
                    <TableCell>
                      {appt.preferred_time === "matin" ? "Matin" : "Après-midi"}
                    </TableCell>
                    <TableCell>{appt.phone}</TableCell>
                    <TableCell>{getStatusBadge(appt.status)}</TableCell>
                    <TableCell>
                      {appt.status === "pending" && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => setSelectedAppointment(appt)}
                            className="h-8 bg-green-500 hover:bg-green-600"
                          >
                            <Check className="w-3 h-3 mr-1" />
                            Confirmer
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() =>
                              handleStatusChange(appt.id, "cancelled")
                            }
                            className="h-8"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                      {appt.status === "confirmed" && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() =>
                            handleStatusChange(appt.id, "cancelled")
                          }
                          className="h-8"
                        >
                          <X className="w-3 h-3 mr-1" />
                          Annuler
                        </Button>
                      )}
                      {appt.status === "cancelled" && (
                        <span className="text-slate-400 text-sm">Annulé</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredAppointments.length > 20 && (
              <div className="p-4 text-center text-slate-500">
                Affichage de 20 sur {filteredAppointments.length} rendez-vous
              </div>
            )}
          </div>
        )}
      </div>

      {/* Appointment Details Dialog */}
      <Dialog
        open={!!selectedAppointment}
        onOpenChange={() => setSelectedAppointment(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Détails du rendez-vous</DialogTitle>
            <DialogDescription>
              RDV #{selectedAppointment?.id}
            </DialogDescription>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-slate-500">Patient</div>
                  <div className="font-medium">{selectedAppointment.name}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-500">Service</div>
                  <div className="font-medium">
                    {getServiceName(selectedAppointment.service)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-slate-500">Date</div>
                  <div className="font-medium">
                    {selectedAppointment.preferred_date}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-slate-500">Créneau</div>
                  <div className="font-medium">
                    {selectedAppointment.preferred_time === "matin"
                      ? "Matin"
                      : "Après-midi"}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-slate-500">Téléphone</div>
                  <div className="font-medium">{selectedAppointment.phone}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-500">Email</div>
                  <div className="font-medium">{selectedAppointment.email}</div>
                </div>
              </div>
              {selectedAppointment.notes && (
                <div>
                  <div className="text-sm text-slate-500">Notes</div>
                  <div className="text-sm">{selectedAppointment.notes}</div>
                </div>
              )}
              <div>
                <div className="text-sm text-slate-500 mb-2">Statut</div>
                {getStatusBadge(selectedAppointment.status)}
              </div>
            </div>
          )}
          <DialogFooter>
            {selectedAppointment?.status === "pending" && (
              <>
                <Button
                  onClick={() =>
                    handleStatusChange(selectedAppointment.id, "confirmed")
                  }
                  disabled={actionLoading}
                  className="bg-green-500 hover:bg-green-600"
                >
                  Confirmer
                </Button>
                <Button
                  onClick={() =>
                    handleStatusChange(selectedAppointment.id, "cancelled")
                  }
                  disabled={actionLoading}
                  variant="destructive"
                >
                  Annuler
                </Button>
              </>
            )}
            {selectedAppointment?.status === "confirmed" && (
              <Button
                onClick={() =>
                  handleStatusChange(selectedAppointment.id, "cancelled")
                }
                disabled={actionLoading}
                variant="destructive"
              >
                Annuler le rendez-vous
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
