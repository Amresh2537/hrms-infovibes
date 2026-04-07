"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";

type BranchOption = {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  radius: number;
};

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
  workingStatus: "Full-time",
  leavesBenefit: "Standard",
  daysWorking: "5",
  branchId: "",
};

export function CreateEmployeeForm({ branches }: { branches: BranchOption[] }) {
  const router = useRouter();
  const defaultBranch = useMemo(() => branches[0], [branches]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [form, setForm] = useState(() => ({
    ...initialState,
    branchId: defaultBranch?.id ?? "",
    lat: defaultBranch ? String(defaultBranch.lat) : initialState.lat,
    lng: defaultBranch ? String(defaultBranch.lng) : initialState.lng,
    radius: defaultBranch ? String(defaultBranch.radius) : initialState.radius,
  }));
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function closeDialog() {
    setIsDialogOpen(false);
    if (window.location.hash === "#add-employee") {
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  }

  useEffect(() => {
    const openFromEvent = () => {
      setIsDialogOpen(true);
    };

    const openFromHash = () => {
      if (window.location.hash === "#add-employee") {
        setIsDialogOpen(true);
      }
    };

    openFromHash();
    window.addEventListener("open-add-employee-dialog", openFromEvent);
    window.addEventListener("hashchange", openFromHash);

    return () => {
      window.removeEventListener("open-add-employee-dialog", openFromEvent);
      window.removeEventListener("hashchange", openFromHash);
    };
  }, []);

  function handleBranchChange(value: string) {
    const selected = branches.find((branch) => branch.id === value);
    setForm((current) => ({
      ...current,
      branchId: value,
      lat: selected ? String(selected.lat) : current.lat,
      lng: selected ? String(selected.lng) : current.lng,
      radius: selected ? String(selected.radius) : current.radius,
    }));
  }

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
        workingStatus: form.workingStatus,
        leavesBenefit: form.leavesBenefit,
        daysWorking: Number(form.daysWorking),
        branchId: form.branchId || undefined,
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

    setForm({
      ...initialState,
      branchId: defaultBranch?.id ?? "",
      lat: defaultBranch ? String(defaultBranch.lat) : initialState.lat,
      lng: defaultBranch ? String(defaultBranch.lng) : initialState.lng,
      radius: defaultBranch ? String(defaultBranch.radius) : initialState.radius,
    });
    closeDialog();
    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <>
      <div id="add-employee" className="sr-only" aria-hidden="true" />
      {isDialogOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f172a]/60 p-4">
          <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-[#1e293b]">Add Employee</h3>
                <p className="text-sm text-[#64748b]">Fill details and submit to create employee.</p>
              </div>
              <button
                type="button"
                onClick={closeDialog}
                className="rounded-md border border-[#e2e8f0] px-3 py-1 text-sm text-[#475569] hover:bg-[#f8fafc]"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  ["name", "Name", "text"],
                  ["empCode", "Employee Code", "text"],
                  ["email", "Email", "text"],
                  ["phone", "Phone", "text"],
                  ["department", "Department", "text"],
                  ["designation", "Designation / Position", "text"],
                  ["joinDate", "Date of Joining", "date"],
                  ["leavesBenefit", "Leaves Benefit", "text"],
                  ["daysWorking", "No of Days Working", "text"],
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
                      required={!(["password"] as string[]).includes(name)}
                      className="w-full rounded-lg border border-[#e2e8f0] bg-[#f8fafc] px-3 py-2 text-sm outline-none transition focus:border-brand focus:bg-white"
                    />
                  </label>
                ))}

                <label className="block space-y-1.5 text-sm font-medium text-[#374151]">
                  <span>Working Status</span>
                  <select
                    value={form.workingStatus}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        workingStatus: event.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-[#e2e8f0] bg-[#f8fafc] px-3 py-2 text-sm outline-none transition focus:border-brand focus:bg-white"
                  >
                    <option value="WFH">WFH</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Full-time">Full-time</option>
                  </select>
                </label>

                <label className="block space-y-1.5 text-sm font-medium text-[#374151]">
                  <span>Working Location (Branch)</span>
                  <select
                    value={form.branchId}
                    onChange={(event) => handleBranchChange(event.target.value)}
                    className="w-full rounded-lg border border-[#e2e8f0] bg-[#f8fafc] px-3 py-2 text-sm outline-none transition focus:border-brand focus:bg-white"
                  >
                    <option value="">Custom Location</option>
                    {branches.map((branch) => (
                      <option key={branch.id} value={branch.id}>
                        {branch.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              {error ? <p className="mt-4 text-sm text-danger">{error}</p> : null}

              <div className="mt-5 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={closeDialog}
                  className="rounded-lg border border-[#e2e8f0] px-4 py-2 text-sm font-semibold text-[#1e293b] hover:bg-[#f8fafc]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-strong disabled:opacity-60"
                >
                  {isPending ? "Saving..." : "Submit Employee"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
