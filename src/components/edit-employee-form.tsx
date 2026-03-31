"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type BankDetails = {
  bankName: string;
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  passbookFileUrl: string;
};

type Documents = {
  aadharUrl: string;
  panUrl: string;
  offerLetterUrl: string;
  offerAcceptanceUrl: string;
  joiningLetterUrl: string;
  employeeAgreementUrl: string;
  responsibilitiesLetterUrl: string;
  dresscodeGuidelinesUrl: string;
  resignationFromLastOrgUrl: string;
  resumeUrl: string;
  idUrl: string;
  upiScannerUrl: string;
};

type EmployeeFormData = {
  id: string;
  name: string;
  empCode: string;
  email: string;
  officialEmail: string;
  phone: string;
  altPhone: string;
  department: string;
  designation: string;
  gender: string;
  maritalStatus: string;
  numChildren: string;
  dob: string;
  joinDate: string;
  residenceAddress: string;
  correspondenceAddress: string;
  salary: string;
  remarks: string;
  status: "active" | "inactive";
  workLocation: {
    lat: string;
    lng: string;
    radius: string;
  };
  leaveBalance: {
    CL: string;
    SL: string;
  };
  bankDetails: BankDetails;
  documents: Documents;
};

type EditEmployeeFormProps = {
  employee: EmployeeFormData;
  activeCount: number;
};

const documentFields: Array<{ key: keyof Documents; label: string }> = [
  { key: "aadharUrl", label: "Aadhar" },
  { key: "panUrl", label: "PAN" },
  { key: "offerLetterUrl", label: "Offer Letter" },
  { key: "offerAcceptanceUrl", label: "Offer Acceptance" },
  { key: "joiningLetterUrl", label: "Joining Letter" },
  { key: "employeeAgreementUrl", label: "Employee Agreement" },
  { key: "responsibilitiesLetterUrl", label: "Responsibilities Letter" },
  { key: "dresscodeGuidelinesUrl", label: "Dress Code Guidelines" },
  { key: "resignationFromLastOrgUrl", label: "Resignation from Last Org" },
  { key: "resumeUrl", label: "Resume" },
  { key: "idUrl", label: "ID Proof" },
  { key: "upiScannerUrl", label: "UPI Scanner" },
];

export function EditEmployeeForm({ employee, activeCount }: EditEmployeeFormProps) {
  const router = useRouter();
  const [form, setForm] = useState(employee);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Password change state
  const [pwForm, setPwForm] = useState({ newPassword: "", confirmPassword: "" });
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = useState<string | null>(null);
  const [isPwPending, startPwTransition] = useTransition();

  function updateField<K extends keyof EmployeeFormData>(key: K, value: EmployeeFormData[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function updateNested(
    group: "workLocation" | "leaveBalance" | "bankDetails" | "documents",
    key: string,
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      [group]: {
        ...current[group],
        [key]: value,
      },
    }));
  }

  async function uploadFile(
    file: File,
    group: "bankDetails" | "documents",
    key: string,
  ) {
    setError(null);
    setSuccess(null);
    setUploadingKey(`${group}.${key}`);

    const body = new FormData();
    body.append("file", file);

    const response = await fetch("/api/upload", {
      method: "POST",
      body,
    });

    const data = await response.json().catch(() => ({}));
    setUploadingKey(null);

    if (!response.ok) {
      setError(data.error ?? "Upload failed.");
      return;
    }

    updateNested(group, key, data.url as string);
    setSuccess("File uploaded successfully.");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const response = await fetch(`/api/employees/${form.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: form.name,
        empCode: form.empCode,
        email: form.email,
        officialEmail: form.officialEmail || undefined,
        phone: form.phone,
        altPhone: form.altPhone || undefined,
        department: form.department,
        designation: form.designation,
        gender: form.gender,
        maritalStatus: form.maritalStatus,
        numChildren: Number(form.numChildren || 0),
        dob: form.dob || undefined,
        joinDate: form.joinDate,
        residenceAddress: form.residenceAddress || undefined,
        correspondenceAddress: form.correspondenceAddress || undefined,
        salary: form.salary ? Number(form.salary) : undefined,
        remarks: form.remarks || undefined,
        status: form.status,
        workLocation: {
          lat: Number(form.workLocation.lat),
          lng: Number(form.workLocation.lng),
          radius: Number(form.workLocation.radius),
        },
        leaveBalance: {
          CL: Number(form.leaveBalance.CL),
          SL: Number(form.leaveBalance.SL),
        },
        bankDetails: form.bankDetails,
        documents: form.documents,
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      setError(data.error ?? "Employee could not be updated.");
      return;
    }

    setSuccess("Employee updated successfully.");
    startTransition(() => {
      router.refresh();
    });
  }

  async function handlePasswordUpdate() {
    setPwError(null);
    setPwSuccess(null);

    if (pwForm.newPassword.length < 8) {
      setPwError("Password must be at least 8 characters.");
      return;
    }

    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwError("Passwords do not match.");
      return;
    }

    const response = await fetch(`/api/employees/${form.id}/password`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newPassword: pwForm.newPassword }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      setPwError(data.error ?? "Password could not be updated.");
      return;
    }

    setPwSuccess("Password updated successfully.");
    startPwTransition(() => {
      setPwForm({ newPassword: "", confirmPassword: "" });
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
            Employee Management
          </div>
          <h1 className="text-2xl font-bold text-[#1e293b]">Edit Employee</h1>
          <p className="mt-1 text-sm text-[#64748b]">
            Update personal details, employment records, bank details, and uploaded documents.
          </p>
        </div>
        <div className="rounded-xl border border-[#e2e8f0] bg-white px-5 py-3 text-center shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wide text-[#64748b]">
            Active Employees
          </div>
          <div className="mt-1 text-3xl font-bold text-[#0f766e]">{activeCount}</div>
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-sm text-[#991b1b]">
          {error}
        </div>
      ) : null}
      {success ? (
        <div className="rounded-xl border border-[#bbf7d0] bg-[#f0fdf4] px-4 py-3 text-sm text-[#166534]">
          {success}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="space-y-6">
          <section className="rounded-xl border border-[#e2e8f0] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#1e293b]">Personal Details</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <Field label="Full Name" required>
                <TextInput value={form.name} onChange={(value) => updateField("name", value)} required />
              </Field>
              <Field label="Employee Code" required>
                <TextInput value={form.empCode} onChange={(value) => updateField("empCode", value)} required />
              </Field>
              <Field label="Date of Birth">
                <TextInput type="date" value={form.dob} onChange={(value) => updateField("dob", value)} />
              </Field>
              <Field label="Gender">
                <SelectInput
                  value={form.gender}
                  onChange={(value) => updateField("gender", value)}
                  options={["", "Male", "Female", "Other"]}
                />
              </Field>
              <Field label="Marital Status">
                <SelectInput
                  value={form.maritalStatus}
                  onChange={(value) => updateField("maritalStatus", value)}
                  options={["", "Single", "Married", "Divorced", "Widowed"]}
                />
              </Field>
              <Field label="No. of Children">
                <TextInput type="number" value={form.numChildren} onChange={(value) => updateField("numChildren", value)} />
              </Field>
            </div>
          </section>

          <section className="rounded-xl border border-[#e2e8f0] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#1e293b]">Contact and Address</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <Field label="Contact No." required>
                <TextInput value={form.phone} onChange={(value) => updateField("phone", value)} required />
              </Field>
              <Field label="Alt Contact">
                <TextInput value={form.altPhone} onChange={(value) => updateField("altPhone", value)} />
              </Field>
              <Field label="Personal Email" required>
                <TextInput type="email" value={form.email} onChange={(value) => updateField("email", value)} required />
              </Field>
              <Field label="Official Email">
                <TextInput type="email" value={form.officialEmail} onChange={(value) => updateField("officialEmail", value)} />
              </Field>
              <Field label="Residence Address" className="md:col-span-2">
                <TextArea value={form.residenceAddress} onChange={(value) => updateField("residenceAddress", value)} />
              </Field>
              <Field label="Correspondence Address" className="md:col-span-2">
                <TextArea value={form.correspondenceAddress} onChange={(value) => updateField("correspondenceAddress", value)} />
              </Field>
            </div>
          </section>

          <section className="rounded-xl border border-[#e2e8f0] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#1e293b]">Employment Details</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Field label="Department" required>
                <TextInput value={form.department} onChange={(value) => updateField("department", value)} required />
              </Field>
              <Field label="Designation" required>
                <TextInput value={form.designation} onChange={(value) => updateField("designation", value)} required />
              </Field>
              <Field label="Joining Date" required>
                <TextInput type="date" value={form.joinDate} onChange={(value) => updateField("joinDate", value)} required />
              </Field>
              <Field label="Employee Status">
                <SelectInput
                  value={form.status}
                  onChange={(value) => updateField("status", value as "active" | "inactive")}
                  options={["active", "inactive"]}
                />
              </Field>
              <Field label="Salary">
                <TextInput type="number" value={form.salary} onChange={(value) => updateField("salary", value)} />
              </Field>
              <Field label="Remarks" className="lg:col-span-3">
                <TextArea value={form.remarks} onChange={(value) => updateField("remarks", value)} rows={3} />
              </Field>
            </div>
          </section>

          <section className="rounded-xl border border-[#e2e8f0] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#1e293b]">Attendance and Leave Controls</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Field label="Office Latitude" required>
                <TextInput value={form.workLocation.lat} onChange={(value) => updateNested("workLocation", "lat", value)} required />
              </Field>
              <Field label="Office Longitude" required>
                <TextInput value={form.workLocation.lng} onChange={(value) => updateNested("workLocation", "lng", value)} required />
              </Field>
              <Field label="Radius (metres)" required>
                <TextInput value={form.workLocation.radius} onChange={(value) => updateNested("workLocation", "radius", value)} required />
              </Field>
              <Field label="CL Balance" required>
                <TextInput value={form.leaveBalance.CL} onChange={(value) => updateNested("leaveBalance", "CL", value)} required />
              </Field>
              <Field label="SL Balance" required>
                <TextInput value={form.leaveBalance.SL} onChange={(value) => updateNested("leaveBalance", "SL", value)} required />
              </Field>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-xl border border-[#e2e8f0] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#1e293b]">Bank Details</h2>
            <div className="mt-5 grid gap-4">
              <Field label="Bank Name">
                <TextInput value={form.bankDetails.bankName} onChange={(value) => updateNested("bankDetails", "bankName", value)} />
              </Field>
              <Field label="Account Holder Name">
                <TextInput value={form.bankDetails.accountHolderName} onChange={(value) => updateNested("bankDetails", "accountHolderName", value)} />
              </Field>
              <Field label="Account Number">
                <TextInput value={form.bankDetails.accountNumber} onChange={(value) => updateNested("bankDetails", "accountNumber", value)} />
              </Field>
              <Field label="IFSC Code">
                <TextInput value={form.bankDetails.ifscCode} onChange={(value) => updateNested("bankDetails", "ifscCode", value.toUpperCase())} />
              </Field>
              <UploadField
                label="Passbook / Cancelled Cheque"
                currentUrl={form.bankDetails.passbookFileUrl}
                isUploading={uploadingKey === "bankDetails.passbookFileUrl"}
                onUpload={(file) => uploadFile(file, "bankDetails", "passbookFileUrl")}
              />
            </div>
          </section>

          <section className="rounded-xl border border-[#e2e8f0] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#1e293b]">Document Uploads</h2>
            <div className="mt-5 space-y-4">
              {documentFields.map((field) => (
                <UploadField
                  key={field.key}
                  label={field.label}
                  currentUrl={form.documents[field.key]}
                  isUploading={uploadingKey === `documents.${field.key}`}
                  onUpload={(file) => uploadFile(file, "documents", field.key)}
                />
              ))}
            </div>
          </section>

          <div className="rounded-xl border border-[#e2e8f0] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#1e293b]">Change Password</h2>
            <p className="mt-1 text-xs text-[#64748b]">Update the login password for this employee account.</p>

            {pwError ? (
              <div className="mt-3 rounded-lg border border-[#fecaca] bg-[#fef2f2] px-4 py-2 text-sm text-[#991b1b]">
                {pwError}
              </div>
            ) : null}
            {pwSuccess ? (
              <div className="mt-3 rounded-lg border border-[#bbf7d0] bg-[#f0fdf4] px-4 py-2 text-sm text-[#166534]">
                {pwSuccess}
              </div>
            ) : null}

            <div className="mt-4 space-y-4">
              <Field label="New Password" required>
                <TextInput
                  type="password"
                  value={pwForm.newPassword}
                  onChange={(value) => setPwForm((prev) => ({ ...prev, newPassword: value }))}
                  required
                />
              </Field>
              <Field label="Confirm Password" required>
                <TextInput
                  type="password"
                  value={pwForm.confirmPassword}
                  onChange={(value) => setPwForm((prev) => ({ ...prev, confirmPassword: value }))}
                  required
                />
              </Field>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                disabled={isPwPending}
                onClick={handlePasswordUpdate}
                className="rounded-lg bg-[#0f766e] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#0d9488] disabled:opacity-60"
              >
                {isPwPending ? "Updating..." : "Update Password"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => router.push("/dashboard/hr/employees")}
          className="rounded-lg border border-[#e2e8f0] bg-white px-5 py-2 text-sm font-semibold text-[#1e293b] transition hover:bg-[#f8fafc]"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-[#0f766e] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#0d9488] disabled:opacity-60"
        >
          {isPending ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  children,
  className = "",
  required = false,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
  required?: boolean;
}) {
  return (
    <label className={`block space-y-1.5 text-sm font-medium text-[#374151] ${className}`}>
      <span>
        {label}
        {required ? <span className="ml-1 text-[#dc2626]">*</span> : null}
      </span>
      {children}
    </label>
  );
}

function TextInput({
  value,
  onChange,
  type = "text",
  required = false,
}: {
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <input
      type={type}
      value={value}
      required={required}
      onChange={(event) => onChange(event.target.value)}
      className="w-full rounded-lg border border-[#e2e8f0] bg-[#f8fafc] px-3 py-2 text-sm outline-none transition focus:border-brand focus:bg-white"
    />
  );
}

function TextArea({
  value,
  onChange,
  rows = 2,
}: {
  value: string;
  onChange: (value: string) => void;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      rows={rows}
      onChange={(event) => onChange(event.target.value)}
      className="w-full rounded-lg border border-[#e2e8f0] bg-[#f8fafc] px-3 py-2 text-sm outline-none transition focus:border-brand focus:bg-white"
    />
  );
}

function SelectInput({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="w-full rounded-lg border border-[#e2e8f0] bg-[#f8fafc] px-3 py-2 text-sm outline-none transition focus:border-brand focus:bg-white"
    >
      {options.map((option) => (
        <option key={option || "empty"} value={option}>
          {option || "Select"}
        </option>
      ))}
    </select>
  );
}

function UploadField({
  label,
  currentUrl,
  isUploading,
  onUpload,
}: {
  label: string;
  currentUrl: string;
  isUploading: boolean;
  onUpload: (file: File) => void;
}) {
  return (
    <div className="rounded-lg border border-[#e2e8f0] p-3">
      <div className="mb-2 text-sm font-medium text-[#1e293b]">{label}</div>
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp,application/pdf"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) {
              onUpload(file);
            }
          }}
          className="block max-w-full text-xs text-[#64748b] file:mr-3 file:rounded-lg file:border-0 file:bg-[#e6fffa] file:px-3 file:py-2 file:text-xs file:font-semibold file:text-[#0f766e]"
        />
        {isUploading ? <span className="text-xs text-[#0f766e]">Uploading...</span> : null}
        {currentUrl ? (
          <a href={currentUrl} target="_blank" rel="noreferrer" className="text-xs font-semibold text-[#0f766e] underline">
            View current file
          </a>
        ) : (
          <span className="text-xs text-[#64748b]">Not uploaded</span>
        )}
      </div>
    </div>
  );
}
