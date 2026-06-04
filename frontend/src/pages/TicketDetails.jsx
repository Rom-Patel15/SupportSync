import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";

import API from "../services/api";

function TicketDetails() {
  const { ticketId } = useParams();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("");
  const [customerTickets, setCustomerTickets] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  const role = localStorage.getItem("role");

  useEffect(() => {
    fetchTicket();
    fetchComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchTicket() {
    try {
      const token = localStorage.getItem("token");

      const response = await API.get(
        `/tickets/${ticketId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTicket(response.data);
      setStatus(response.data.status);
      setSubject(response.data.subject);
      setDescription(response.data.description);
      setPriority(response.data.priority);
      setErrorMessage("");

      if (role === "admin") {
        fetchCustomerTickets(response.data.customer_email);
      }
    } catch (error) {
      console.error(error);
      setErrorMessage("Failed to load ticket");
      alert("Failed to load ticket");
    }
  }

  async function fetchCustomerTickets(email) {
    try {
      const token = localStorage.getItem("token");

      const response = await API.get(
        `/tickets/?search=${email}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCustomerTickets(response.data);
    } catch (error) {
      console.error(error);
    }
  }

  async function fetchComments() {
    try {
      const token = localStorage.getItem("token");

      const response = await API.get(
        `/tickets/${ticketId}/comments`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setComments(response.data);
    } catch (error) {
      console.error(error);
    }
  }

  const addComment = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      await API.post(
        `/tickets/${ticketId}/comments`,
        {
          message,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage("");
      setErrorMessage("");
      fetchComments();
    } catch (error) {
      console.error(error);
      setErrorMessage("Failed to add comment");
      alert("Failed to add comment");
    }
  };

  const showToast = (title, icon = "success") => {
    Swal.fire({
      title,
      icon,
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 1800,
    });
  };

  const updateStatus = async () => {
    try {
      const token = localStorage.getItem("token");

      await API.put(
        `/tickets/${ticketId}/status`,
        {
          status,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      showToast("Status updated successfully");
      setErrorMessage("");
      fetchTicket();
    } catch (error) {
      console.error(error);
      setErrorMessage("Failed to update status");
      alert("Failed to update status");
    }
  };

  const updateTicket = async () => {
    try {
      const token = localStorage.getItem("token");

      await API.put(
        `/tickets/${ticketId}`,
        {
          subject,
          description,
          priority,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Ticket updated successfully");
      setIsEditing(false);
      setErrorMessage("");
      fetchTicket();
    } catch (error) {
      console.error(error);
      setErrorMessage("Failed to update ticket");
      alert("Failed to update ticket");
    }
  };

  const showDeleteConfirm = async () => {
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

  const deleteTicket = async () => {
    const confirmDelete = await showDeleteConfirm();

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
      navigate(role === "admin" ? "/admin" : "/customer");
    } catch (error) {
      console.error(error);
      setErrorMessage("Failed to delete ticket");
      alert("Failed to delete ticket");
    }
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

    return new Date(value).toLocaleString();
  };

  const initials = (ticket?.customer_name || "Customer")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (!ticket) {
    return (
      <div className="min-h-screen bg-slate-100 font-['DM_Sans']">
        <div className="flex items-center justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
        </div>
      </div>
    );
  }

  const openCustomerTickets = customerTickets.filter(
    (item) => item.status !== "Closed"
  ).length;

  return (
    <div className="min-h-screen bg-slate-100 px-6 py-8 font-['DM_Sans'] text-slate-900">
      <div className="mx-auto max-w-7xl">
        <button
          type="button"
          onClick={() => navigate(role === "admin" ? "/admin" : "/customer")}
          className="mb-6 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-all duration-150 hover:bg-slate-50"
        >
          &lt;- Back to Tickets
        </button>

        {errorMessage && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {errorMessage}
          </div>
        )}

        <header className="mb-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-blue-50 px-3 py-1 font-mono text-xs font-semibold text-blue-600">
                  {ticket.ticket_id}
                </span>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${priorityBadge(ticket.priority)}`}>
                  {ticket.priority}
                </span>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusBadge(ticket.status)}`}>
                  {ticket.status}
                </span>
                <span className="text-sm text-slate-400">
                  {formatDate(ticket.created_at)}
                </span>
              </div>
              <h1 className="font-['Sora'] text-2xl font-bold text-slate-900">
                {ticket.subject}
              </h1>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-all duration-150 hover:bg-slate-50"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={deleteTicket}
                className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition-all duration-150 hover:bg-red-600 hover:text-white"
              >
                Delete
              </button>
            </div>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(280px,3fr)]">
          <main className="space-y-6">
            <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-5 font-['Sora'] text-lg font-semibold">
                Ticket Information
              </h2>

              {isEditing ? (
                <div className="space-y-4">
                  <label className="block">
                    <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Subject
                    </span>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Description
                    </span>
                    <textarea
                      rows="5"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    />
                  </label>

                  <label className="block max-w-xs">
                    <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Priority
                    </span>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    >
                      <option>Low</option>
                      <option>Medium</option>
                      <option>High</option>
                    </select>
                  </label>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={updateTicket}
                      className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-all duration-150 hover:bg-blue-700"
                    >
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-all duration-150 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid gap-4 md:grid-cols-3">
                    <MetaItem label="ID" value={ticket.ticket_id} />
                    <MetaItem label="Customer" value={ticket.customer_name} />
                    <MetaItem label="Email" value={ticket.customer_email} />
                    <MetaItem label="Priority" value={ticket.priority} />
                    <MetaItem label="Status" value={ticket.status} />
                    <MetaItem label="Date" value={formatDate(ticket.created_at)} />
                  </div>

                  <div className="mt-6 border-t border-slate-200 pt-5">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Description
                    </p>
                    <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
                      {ticket.description}
                    </p>
                  </div>

                  {ticket.attachment_url && (
                    <div className="mt-5">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Attachment
                      </p>
                      <a
                        href={ticket.attachment_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-all duration-150 hover:bg-blue-700"
                      >
                        View Attachment
                      </a>
                    </div>
                  )}
                </>
              )}
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="font-['Sora'] text-lg font-semibold">
                  Conversation Thread
                </h2>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">
                  {comments.length} messages
                </span>
              </div>

              {comments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                  <IconMessage />
                  <p className="mt-3 font-semibold text-slate-600">No comments found</p>
                  <p className="mt-1 text-sm">Start the conversation below</p>
                </div>
              ) : (
                <div className="space-y-5">
                  {comments.map((comment) => {
                    const isAdmin = comment.role === "admin";

                    return (
                      <div
                        key={comment.id}
                        className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}
                      >
                        <div className={`max-w-[82%] ${isAdmin ? "text-right" : "text-left"}`}>
                          <p className={`mb-1 text-xs font-semibold ${isAdmin ? "text-slate-500" : "text-blue-600"}`}>
                            {comment.user_name} ({comment.role}) - {formatDate(comment.created_at)}
                          </p>
                          <div className={`rounded-2xl border px-4 py-3 text-sm leading-6 ${
                            isAdmin
                              ? "rounded-br-sm border-slate-200 bg-slate-100 text-slate-700"
                              : "rounded-bl-sm border-blue-100 bg-blue-50 text-slate-700"
                          }`}
                          >
                            {comment.message}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 font-['Sora'] text-lg font-semibold">
                Add Comment
              </h2>

              <form onSubmit={addComment}>
                <textarea
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  rows="4"
                  placeholder="Write your reply..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                />

                <button
                  type="submit"
                  className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-all duration-150 hover:bg-blue-700"
                >
                  Send Reply
                </button>
              </form>
            </section>
          </main>

          <aside className="space-y-6">
            {role === "admin" ? (
              <>
                <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h2 className="mb-4 font-['Sora'] text-base font-semibold">
                    Update Status
                  </h2>
                  <div className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-600">
                    <span className={`h-2.5 w-2.5 rounded-full ${
                      ticket.status === "Closed"
                        ? "bg-green-500"
                        : ticket.status === "In Progress"
                          ? "bg-amber-500"
                          : "bg-sky-500"
                    }`}
                    />
                    {ticket.status}
                  </div>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="mb-3 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  >
                    <option>Open</option>
                    <option>In Progress</option>
                    <option>Closed</option>
                  </select>
                  <button
                    type="button"
                    onClick={updateStatus}
                    className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-all duration-150 hover:bg-blue-700"
                  >
                    Update Status
                  </button>
                </section>

                <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h2 className="mb-4 font-['Sora'] text-base font-semibold">
                    Customer Info
                  </h2>
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-600">
                      {initials}
                    </span>
                    <div>
                      <p className="font-semibold text-slate-900">
                        {ticket.customer_name}
                      </p>
                      <p className="text-sm text-slate-500">
                        {ticket.customer_email}
                      </p>
                    </div>
                  </div>
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-slate-50 p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Total tickets
                      </p>
                      <p className="mt-1 font-['Sora'] text-xl font-bold">
                        {customerTickets.length}
                      </p>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Open tickets
                      </p>
                      <p className="mt-1 font-['Sora'] text-xl font-bold">
                        {openCustomerTickets}
                      </p>
                    </div>
                  </div>
                </section>

                <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h2 className="mb-4 font-['Sora'] text-base font-semibold">
                    Quick Actions
                  </h2>
                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-all duration-150 hover:bg-slate-50"
                    >
                      Edit Ticket
                    </button>
                    <button
                      type="button"
                      onClick={deleteTicket}
                      className="w-full rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition-all duration-150 hover:bg-red-600 hover:text-white"
                    >
                      Delete Ticket
                    </button>
                  </div>
                </section>
              </>
            ) : (
              <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="mb-4 font-['Sora'] text-base font-semibold">
                  Current Status
                </h2>
                <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                  <span className={`h-2.5 w-2.5 rounded-full ${
                    ticket.status === "Closed"
                      ? "bg-green-500"
                      : ticket.status === "In Progress"
                        ? "bg-amber-500"
                        : "bg-sky-500"
                  }`}
                  />
                  {ticket.status}
                </div>
              </section>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}

function MetaItem({ label, value }) {
  return (
    <div className="rounded-lg bg-slate-50 p-4">
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="break-words text-sm font-medium text-slate-700">
        {value}
      </p>
    </div>
  );
}

function IconMessage() {
  return (
    <svg className="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z" />
    </svg>
  );
}

export default TicketDetails;
