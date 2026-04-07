"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function EmployeeRowActions({ employeeId, employeeName }: { employeeId: string; employeeName: string }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  async function handleDelete() {
    setIsDeleting(true);

    const response = await fetch(`/api/employees/${employeeId}`, {
      method: "DELETE",
    });

    setIsDeleting(false);

    if (!response.ok) {
      window.alert("Failed to remove employee.");
      return;
    }

    setShowConfirm(false);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href={`/dashboard/hr/employees/${employeeId}/edit`}
        className="inline-flex items-center gap-1.5 rounded-lg border border-[#e2e8f0] bg-white px-3 py-1.5 text-xs font-semibold text-[#1e293b] shadow-sm transition hover:border-[#0f766e] hover:bg-[#f0fdf4] hover:text-[#0f766e]"
      >
        Edit
      </Link>
      <button
        type="button"
        onClick={() => setShowConfirm(true)}
        disabled={isDeleting}
        className="inline-flex items-center gap-1.5 rounded-lg border border-[#fecaca] bg-white px-3 py-1.5 text-xs font-semibold text-[#b91c1c] shadow-sm transition hover:bg-[#fef2f2] disabled:opacity-60"
      >
        {isDeleting ? "Removing..." : "Remove"}
      </button>

      {showConfirm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f172a]/60 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-[#1e293b]">Confirm Remove Employee</h3>
            <p className="mt-2 text-sm text-[#475569]">
              Are you sure you want to remove <span className="font-semibold">{employeeName}</span>? This will delete the employee record and linked login access.
            </p>
            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="rounded-lg border border-[#e2e8f0] px-4 py-2 text-sm font-semibold text-[#1e293b] hover:bg-[#f8fafc]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="rounded-lg bg-[#b91c1c] px-4 py-2 text-sm font-semibold text-white hover:bg-[#991b1b] disabled:opacity-60"
              >
                {isDeleting ? "Removing..." : "Yes, Remove"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
