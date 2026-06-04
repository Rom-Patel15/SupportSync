import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import API from "../services/api";

function CustomerDashboard() {
  const navigate = useNavigate();

  const [tickets, setTickets] = useState([]);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [attachment, setAttachment] = useState(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(true);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const userName = localStorage.getItem("name") || "Customer";
  const initials = userName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  useEffect(() => {
    fetchTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("name");

    navigate("/");
  };

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
    } catch (error) {
      console.error(error);
      alert("Failed to load tickets");
    } finally {
      setIsLoading(false);
    }
  }

  const createTicket = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();

      formData.append("subject", subject);
      formData.append("description", description);
      formData.append("priority", priority);

      if (attachment) {
        formData.append(
          "attachment",
          attachment
        );
      }

      await API.post(
        "/tickets/",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

      alert("Ticket created successfully");

      setSubject("");
      setDescription("");
      setPriority("Medium");
      setAttachment(null);
      setFileInputKey((current) => current + 1);

      fetchTickets();
    } catch (error) {
      console.error(error);
      alert("Failed to create ticket");
    }
  };

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
    } catch (error) {
      console.error(error);
      alert("Failed to delete ticket");
    }
  };

  const resetCreateForm = () => {
    setSubject("");
    setDescription("");
    setPriority("Medium");
    setAttachment(null);
    setFileInputKey((current) => current + 1);
    setIsCreateOpen(false);
  };

  const filteredTickets = useMemo(() => {
    if (!priorityFilter) {
      return tickets;
    }

    return tickets.filter(
      (ticket) => ticket.priority === priorityFilter
    );
  }, [tickets, priorityFilter]);

  const stats = {
    total: tickets.length,
    open: tickets.filter((ticket) => ticket.status === "Open").length,
    inProgress: tickets.filter((ticket) => ticket.status === "In Progress").length,
    closed: tickets.filter((ticket) => ticket.status === "Closed").length,
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
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
              <IconHeadset />
            </div>
            <span className="font-['Sora'] text-lg font-bold">
              SupportSync
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white py-1 pl-1 pr-3 text-sm font-medium text-slate-700 sm:flex">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-600">
                {initials}
              </span>
              Welcome, {userName}
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

      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Tickets" value={stats.total} accent="border-t-blue-600" icon={<IconTicket />} />
          <StatCard label="Open" value={stats.open} accent="border-t-amber-500" icon={<IconClock />} />
          <StatCard label="In Progress" value={stats.inProgress} accent="border-t-red-500" icon={<IconProgress />} />
          <StatCard label="Closed" value={stats.closed} accent="border-t-green-500" icon={<IconCheck />} />
        </div>

        <section className="mt-8 rounded-xl border border-slate-200 bg-white shadow-sm">
          <button
            type="button"
            onClick={() => setIsCreateOpen(!isCreateOpen)}
            className="flex w-full items-center justify-between px-6 py-4 text-left"
          >
            <span className="font-['Sora'] text-lg font-semibold">
              Create New Ticket
            </span>
            <svg
              aria-hidden="true"
              className={`h-5 w-5 text-slate-400 transition ${isCreateOpen ? "rotate-180" : ""}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>

          {isCreateOpen && (
            <form onSubmit={createTicket} className="space-y-5 border-t border-slate-200 px-6 py-6">
              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Subject
                </span>
                <input
                  type="text"
                  placeholder="Briefly describe the issue"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                />
              </label>

              <div className="grid gap-5 md:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Priority
                  </span>
                  <select
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                </label>

                <label className="block">
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    File Upload
                  </span>
                  <input
                    key={fileInputKey}
                    type="file"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm outline-none transition file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-blue-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    onChange={(e) =>
                      setAttachment(
                        e.target.files[0]
                      )
                    }
                  />
                </label>
              </div>

              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Description
                </span>
                <textarea
                  placeholder="Add details that will help support resolve this quickly"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  rows="4"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </label>

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-all duration-150 hover:bg-blue-700"
                >
                  Submit Ticket
                </button>
                <button
                  type="button"
                  onClick={resetCreateForm}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-all duration-150 hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </section>

        <section className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-['Sora'] text-xl font-semibold">
              My Tickets
            </h2>
          </div>

          <div className="mb-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3 lg:flex-row">
              <input
                type="text"
                placeholder="Search my tickets..."
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

          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
              </div>
            ) : filteredTickets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                <IconEmpty />
                <p className="mt-3 font-semibold text-slate-600">No tickets found</p>
                <p className="mt-1 text-sm">Try adjusting your filters</p>
              </div>
            ) : (
              <table className="w-full min-w-[760px]">
                <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-400">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Ticket ID</th>
                    <th className="px-4 py-3 font-semibold">Subject</th>
                    <th className="px-4 py-3 font-semibold">Priority</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Date</th>
                    <th className="px-4 py-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTickets.map((ticket) => (
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
                      <td className="px-4 py-4">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${priorityBadge(ticket.priority)}`}>
                          {ticket.priority}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusBadge(ticket.status)}`}>
                          {ticket.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-500">
                        {formatDate(ticket.created_at)}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => navigate(`/ticket/${ticket.ticket_id}`)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50"
                            aria-label="View ticket"
                          >
                            <IconEye />
                          </button>
                          <button
                            type="button"
                            onClick={() => navigate(`/ticket/${ticket.ticket_id}`)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50"
                            aria-label="Edit ticket"
                          >
                            <IconPencil />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteTicket(ticket.ticket_id)}
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
            )}
          </div>
        </section>
      </main>
    </div>
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

function IconHeadset() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 11a9 9 0 0 1 18 0" />
      <path d="M5 11v5a2 2 0 0 0 2 2h1v-7H7a2 2 0 0 0-2 2" />
      <path d="M19 11v5a2 2 0 0 1-2 2h-1v-7h1a2 2 0 0 1 2 2" />
    </svg>
  );
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

function IconEye() {
  return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></svg>;
}

function IconPencil() {
  return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m18 2 4 4-12 12H6v-4Z" /><path d="M14 6l4 4" /></svg>;
}

function IconTrash() {
  return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="M19 6l-1 14H6L5 6" /></svg>;
}

function IconEmpty() {
  return <svg className="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 7h16" /><path d="M5 7l1 13h12l1-13" /><path d="M9 7V4h6v3" /></svg>;
}

export default CustomerDashboard;
