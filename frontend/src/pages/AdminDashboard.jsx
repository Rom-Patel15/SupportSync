import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import API from "../services/api";

function AdminDashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [activeView, setActiveView] = useState("dashboard");
  const [isLoading, setIsLoading] = useState(false);

  const userName = localStorage.getItem("name") || "Admin";
  const initials = userName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  useEffect(() => {
    fetchStats();
    fetchTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("name");

    navigate("/");
  };

  async function fetchStats() {
    try {
      const token = localStorage.getItem("token");

      const response = await API.get(
        "/dashboard/stats",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setStats(response.data);
    } catch {
      alert("Failed to load dashboard stats");
    }
  }

  async function fetchTickets() {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");

      let url = "/tickets/?";

      if (search) {
        url += `search=${search}&`;
      }

      if (status) {
        url += `status=${status}`;
      }

      const response = await API.get(
        url,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTickets(response.data);
    } catch {
      alert("Failed to load tickets");
    } finally {
      setIsLoading(false);
    }
  }

  const showConfirm = async () => {
    const result = await Swal.fire({
      title: "Delete ticket?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Delete",
    });

    return result.isConfirmed;
  };

  const deleteTicket = async (ticketId) => {
    const confirmDelete = await showConfirm();

    if (!confirmDelete) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      await API.delete(
        `/tickets/${ticketId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Ticket deleted successfully");

      fetchTickets();
      fetchStats();
    } catch (error) {
      console.error(error);
      alert("Failed to delete ticket");
    }
  };

  const updateTicketStatus = async (ticketId, nextStatus) => {
    try {
      const token = localStorage.getItem("token");

      await API.put(
        `/tickets/${ticketId}/status`,
        {
          status: nextStatus,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchTickets();
      fetchStats();
    } catch (error) {
      console.error(error);
      alert("Failed to update status");
    }
  };

  const filteredTickets = useMemo(() => {
    if (!priorityFilter) {
      return tickets;
    }

    return tickets.filter(
      (ticket) => ticket.priority === priorityFilter
    );
  }, [tickets, priorityFilter]);

  const recentTickets = tickets.slice(0, 5);
  const totalTickets = stats?.total_tickets || 0;

  const priorityCounts = {
    High: tickets.filter((ticket) => ticket.priority === "High").length,
    Medium: tickets.filter((ticket) => ticket.priority === "Medium").length,
    Low: tickets.filter((ticket) => ticket.priority === "Low").length,
  };

  const percent = (value, total) => {
    if (!total) {
      return "0%";
    }

    return `${Math.max((value / total) * 100, value ? 8 : 0)}%`;
  };

  const statusBadge = (value) => {
    if (value === "Closed") {
      return "bg-green-100 text-green-700";
    }

    if (value === "In Progress") {
      return "bg-amber-100 text-amber-700";
    }

    return "bg-sky-100 text-sky-700";
  };

  const priorityBadge = (value) => {
    if (value === "High") {
      return "bg-red-100 text-red-600";
    }

    if (value === "Low") {
      return "bg-green-100 text-green-700";
    }

    return "bg-amber-100 text-amber-600";
  };

  const formatDate = (value) => {
    if (!value) {
      return "-";
    }

    return new Date(value).toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-slate-100 font-['DM_Sans'] text-slate-900">
      <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
              <IconHeadset />
            </div>
            <span className="font-['Sora'] text-lg font-bold">
              SupportSync
            </span>
            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-600">
              Admin
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white py-1 pl-1 pr-3 text-sm font-medium text-slate-700 sm:flex">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-600">
                {initials}
              </span>
              {userName}
            </div>
            <button
              onClick={handleLogout}
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition-all duration-150 hover:bg-red-600 hover:text-white"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="flex">
        <aside className="sticky top-[65px] hidden h-[calc(100vh-65px)] w-60 shrink-0 border-r border-slate-200 bg-white p-4 lg:block">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Main
          </p>
          <div className="space-y-1">
            <SidebarButton label="Dashboard" active={activeView === "dashboard"} onClick={() => setActiveView("dashboard")} />
            <SidebarButton label="All Tickets" active={activeView === "tickets"} onClick={() => setActiveView("tickets")} badge={stats?.open_tickets || 0} />
          </div>
        </aside>

        <main className="min-w-0 flex-1 px-6 py-8">
          {activeView === "dashboard" ? (
            <>
              <div className="mb-6">
                <h1 className="font-['Sora'] text-2xl font-bold text-slate-900">
                  Dashboard Overview
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  Track ticket volume, urgency, and support workload.
                </p>
              </div>

              {!stats ? (
                <div className="flex items-center justify-center py-12">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                </div>
              ) : (
                <>
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                    <StatCard label="Total" value={stats.total_tickets} accent="border-t-blue-600" icon={<IconTicket />} />
                    <StatCard label="Open" value={stats.open_tickets} accent="border-t-amber-500" icon={<IconClock />} />
                    <StatCard label="In Progress" value={stats.in_progress_tickets} accent="border-t-red-500" icon={<IconProgress />} />
                    <StatCard label="Closed" value={stats.closed_tickets} accent="border-t-green-500" icon={<IconCheck />} />
                    <StatCard label="High Priority" value={stats.high_priority_tickets} accent="border-t-red-500" icon={<IconAlert />} />
                  </div>

                  <div className="mt-6 grid gap-6 xl:grid-cols-2">
                    <ChartCard title="Status Distribution">
                      <BarRow label="Open" value={stats.open_tickets} width={percent(stats.open_tickets, totalTickets)} color="bg-sky-500" />
                      <BarRow label="In Progress" value={stats.in_progress_tickets} width={percent(stats.in_progress_tickets, totalTickets)} color="bg-amber-500" />
                      <BarRow label="Closed" value={stats.closed_tickets} width={percent(stats.closed_tickets, totalTickets)} color="bg-green-500" />
                    </ChartCard>
                    <ChartCard title="Priority Breakdown">
                      <BarRow label="High" value={priorityCounts.High} width={percent(priorityCounts.High, tickets.length)} color="bg-red-500" />
                      <BarRow label="Medium" value={priorityCounts.Medium} width={percent(priorityCounts.Medium, tickets.length)} color="bg-amber-500" />
                      <BarRow label="Low" value={priorityCounts.Low} width={percent(priorityCounts.Low, tickets.length)} color="bg-green-500" />
                    </ChartCard>
                  </div>

                  <section className="mt-8">
                    <div className="mb-4 flex items-center justify-between">
                      <h2 className="font-['Sora'] text-xl font-semibold">
                        Recent Tickets
                      </h2>
                      <button
                        type="button"
                        onClick={() => setActiveView("tickets")}
                        className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                      >
                        View all -&gt;
                      </button>
                    </div>
                    <TicketTable
                      tickets={recentTickets}
                      showCustomer
                      statusBadge={statusBadge}
                      priorityBadge={priorityBadge}
                      formatDate={formatDate}
                      onDelete={deleteTicket}
                      onStatusChange={null}
                    />
                  </section>
                </>
              )}
            </>
          ) : (
            <>
              <div className="mb-6">
                <h1 className="font-['Sora'] text-2xl font-bold text-slate-900">
                  All Tickets
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  Search, filter, update, and manage submitted tickets.
                </p>
              </div>

              <div className="mb-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-3 xl:flex-row">
                  <input
                    type="text"
                    placeholder="Search tickets..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full flex-1 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  />

                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Status</option>
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Closed">Closed</option>
                  </select>

                  <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Priority</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>

                  <button
                    onClick={fetchTickets}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-all duration-150 hover:bg-blue-700"
                  >
                    Search
                  </button>
                </div>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                </div>
              ) : (
                <TicketTable
                  tickets={filteredTickets}
                  showCustomer
                  statusBadge={statusBadge}
                  priorityBadge={priorityBadge}
                  formatDate={formatDate}
                  onDelete={deleteTicket}
                  onStatusChange={updateTicketStatus}
                />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

function SidebarButton({ label, active, onClick, badge }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition ${
        active
          ? "bg-blue-50 font-semibold text-blue-600"
          : "text-slate-600 hover:bg-slate-50"
      }`}
    >
      <span>{label}</span>
      {badge !== undefined && (
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">
          {badge}
        </span>
      )}
    </button>
  );
}

function StatCard({ label, value, accent, icon }) {
  return (
    <div className={`rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md border-t-[3px] ${accent}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="font-['Sora'] text-3xl font-bold text-slate-900">
            {value}
          </p>
          <p className="mt-1 text-sm font-medium text-slate-500">
            {label}
          </p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
          {icon}
        </div>
      </div>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-5 font-['Sora'] text-base font-semibold">
        {title}
      </h2>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}

function BarRow({ label, value, width, color }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="font-medium text-slate-600">{label}</span>
        <span className="text-slate-500">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${color}`} style={{ width }} />
      </div>
    </div>
  );
}

function TicketTable({ tickets, showCustomer, statusBadge, priorityBadge, formatDate, onDelete, onStatusChange }) {
  if (tickets.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <IconEmpty />
          <p className="mt-3 font-semibold text-slate-600">No tickets found</p>
          <p className="mt-1 text-sm">Try adjusting your filters</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full min-w-[840px]">
        <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-400">
          <tr>
            <th className="px-4 py-3 font-semibold">ID</th>
            <th className="px-4 py-3 font-semibold">Subject</th>
            {showCustomer && <th className="px-4 py-3 font-semibold">Customer</th>}
            <th className="px-4 py-3 font-semibold">Priority</th>
            <th className="px-4 py-3 font-semibold">Status</th>
            <th className="px-4 py-3 font-semibold">Date</th>
            <th className="px-4 py-3 font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((ticket) => (
            <tr key={ticket.ticket_id} className="border-b border-slate-100 transition hover:bg-slate-50">
              <td className="px-4 py-4">
                <Link
                  to={`/ticket/${ticket.ticket_id}`}
                  className="font-mono font-semibold text-blue-600 hover:underline"
                >
                  {ticket.ticket_id}
                </Link>
              </td>
              <td className="px-4 py-4 font-medium text-slate-900">
                {ticket.subject}
              </td>
              {showCustomer && (
                <td className="px-4 py-4 text-sm text-slate-500">
                  {ticket.customer_name}
                </td>
              )}
              <td className="px-4 py-4">
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${priorityBadge(ticket.priority)}`}>
                  {ticket.priority}
                </span>
              </td>
              <td className="px-4 py-4">
                {onStatusChange ? (
                  <select
                    value={ticket.status}
                    onChange={(e) => onStatusChange(ticket.ticket_id, e.target.value)}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  >
                    <option>Open</option>
                    <option>In Progress</option>
                    <option>Closed</option>
                  </select>
                ) : (
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusBadge(ticket.status)}`}>
                    {ticket.status}
                  </span>
                )}
              </td>
              <td className="px-4 py-4 text-sm text-slate-500">
                {formatDate(ticket.created_at)}
              </td>
              <td className="px-4 py-4">
                <div className="flex items-center gap-2">
                  <Link
                    to={`/ticket/${ticket.ticket_id}`}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50"
                    aria-label="View ticket"
                  >
                    <IconEye />
                  </Link>
                  <button
                    type="button"
                    onClick={() => onDelete(ticket.ticket_id)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-600 transition hover:bg-red-600 hover:text-white"
                    aria-label="Delete ticket"
                  >
                    <IconTrash />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function IconHeadset() {
  return <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 11a9 9 0 0 1 18 0" /><path d="M5 11v5a2 2 0 0 0 2 2h1v-7H7a2 2 0 0 0-2 2" /><path d="M19 11v5a2 2 0 0 1-2 2h-1v-7h1a2 2 0 0 1 2 2" /></svg>;
}

function IconTicket() {
  return <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9a3 3 0 0 0 0 6v3a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3a3 3 0 0 0 0-6V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2Z" /></svg>;
}

function IconClock() {
  return <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>;
}

function IconProgress() {
  return <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v4" /><path d="M12 18v4" /><path d="m4.9 4.9 2.8 2.8" /><path d="m16.3 16.3 2.8 2.8" /><path d="M2 12h4" /><path d="M18 12h4" /></svg>;
}

function IconCheck() {
  return <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6 9 17l-5-5" /></svg>;
}

function IconAlert() {
  return <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 9v4" /><path d="M12 17h.01" /><path d="M10.3 3.9 2.5 18a2 2 0 0 0 1.7 3h15.6a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" /></svg>;
}

function IconEye() {
  return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></svg>;
}

function IconTrash() {
  return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="M19 6l-1 14H6L5 6" /></svg>;
}

function IconEmpty() {
  return <svg className="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 7h16" /><path d="M5 7l1 13h12l1-13" /><path d="M9 7V4h6v3" /></svg>;
}

export default AdminDashboard;
