"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

const initialState = {
  name: "",
  empCode: "",
  email: "",
  phone: "",
  department: "",
  designation: "",
  joinDate: "",
  password: "",
  lat: "28.6139",
  lng: "77.2090",
  radius: "500",
  casualLeave: "12",
  sickLeave: "6",
};

export function CreateEmployeeForm() {
  const router = useRouter();
  const [form, setForm] = useState(initialState);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const response = await fetch("/api/employees", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: form.name,
        empCode: form.empCode,
        email: form.email,
        phone: form.phone,
        department: form.department,
        designation: form.designation,
        joinDate: form.joinDate,
        password: form.password || undefined,
        workLocation: {
          lat: Number(form.lat),
          lng: Number(form.lng),
          radius: Number(form.radius),
        },
        leaveBalance: {
          CL: Number(form.casualLeave),
          SL: Number(form.sickLeave),
        },
        status: "active",
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.error ?? "Employee could not be created.");
      return;
    }

    setForm(initialState);
    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-[#e2e8f0] bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-[#1e293b]">Add Employee</h2>
      <p className="mt-1 text-sm text-[#64748b]">Create the employee record and optional login.</p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {[
          ["name", "Name", "text"],
          ["empCode", "Employee Code", "text"],
          ["email", "Email", "text"],
          ["phone", "Phone", "text"],
          ["department", "Department", "text"],
          ["designation", "Designation / Position", "text"],
          ["joinDate", "Date of Joining", "date"],
          ["password", "Employee Password", "password"],
          ["lat", "Office Latitude", "text"],
          ["lng", "Office Longitude", "text"],
          ["radius", "Radius (metres)", "text"],
          ["casualLeave", "CL Balance", "text"],
          ["sickLeave", "SL Balance", "text"],
        ].map(([name, label, type]) => (
          <label key={name} className="block space-y-1.5 text-sm font-medium text-[#374151]">
            <span>{label}</span>
            <input
              name={name}
              type={type}
              value={form[name as keyof typeof form]}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  [name]: event.target.value,
                }))
              }
              required={!["password"].includes(name)}
              className="w-full rounded-lg border border-[#e2e8f0] bg-[#f8fafc] px-3 py-2 text-sm outline-none transition focus:border-brand focus:bg-white"
            />
          </label>
        ))}
      </div>

      {error ? <p className="mt-4 text-sm text-danger">{error}</p> : null}

      <button
        type="submit"
        disabled={isPending}
        className="mt-5 w-full rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-strong disabled:opacity-60"
      >
        {isPending ? "Saving..." : "+ Add Employee"}
      </button>
    </form>
  );
}