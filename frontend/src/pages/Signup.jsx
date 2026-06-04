import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import API from "../services/api";

function Signup() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const passwordScore = [
    password.length >= 6,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;

  const strengthColor =
    passwordScore <= 1
      ? "bg-red-500"
      : passwordScore <= 3
        ? "bg-amber-500"
        : "bg-green-500";

  const handleSignup = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      await API.post(
        "/auth/signup",
        {
          name,
          email,
          password,
        }
      );

      alert("Account created successfully");

      navigate("/");
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.detail
      ) {
        setErrorMessage(error.response.data.detail);
      } else {
        setErrorMessage("Signup failed");
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 px-6 py-10 font-['DM_Sans'] text-slate-900 [background-image:radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:22px_22px] flex items-center justify-center">
      <form
        onSubmit={handleSignup}
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-10 shadow-lg animate-[fadeIn_.35s_ease-out]"
      >
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
          <svg
            aria-hidden="true"
            className="h-7 w-7"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 11a9 9 0 0 1 18 0" />
            <path d="M5 11v5a2 2 0 0 0 2 2h1v-7H7a2 2 0 0 0-2 2" />
            <path d="M19 11v5a2 2 0 0 1-2 2h-1v-7h1a2 2 0 0 1 2 2" />
            <path d="M12 19v1" />
          </svg>
        </div>

        <div className="mb-8 text-center">
          <h1 className="font-['Sora'] text-2xl font-bold text-slate-900">
            Create your account
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Join SupportSync to manage your tickets
          </p>
        </div>

        {errorMessage && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {errorMessage}
          </div>
        )}

        <div className="space-y-4">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Full Name
            </span>
            <span className="relative block">
              <svg
                aria-hidden="true"
                className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 21a8 8 0 0 0-16 0" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <input
                type="text"
                placeholder="Enter your full name"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 pl-11 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                required
              />
            </span>
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Email
            </span>
            <span className="relative block">
              <svg
                aria-hidden="true"
                className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-10 6L2 7" />
              </svg>
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 pl-11 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                required
              />
            </span>
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Password
            </span>
            <span className="relative block">
              <svg
                aria-hidden="true"
                className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="18" height="11" x="3" y="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <input
                type="password"
                placeholder="Create a password"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 pl-11 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                required
              />
            </span>
          </label>

          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((segment) => (
              <div
                key={segment}
                className={`h-1.5 rounded-full ${
                  password && passwordScore >= segment
                    ? strengthColor
                    : "bg-slate-200"
                }`}
              />
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="mt-6 w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-all duration-150 hover:bg-blue-700"
        >
          Create Account
        </button>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link
            to="/"
            className="font-semibold text-blue-600 hover:text-blue-700"
          >
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Signup;
