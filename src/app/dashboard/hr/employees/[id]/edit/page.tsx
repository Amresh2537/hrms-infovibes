import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import Employee from "@/models/Employee";
import Settings from "@/models/Settings";
import { EditEmployeeForm } from "@/components/edit-employee-form";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditEmployeePage({ params }: PageProps) {
  await requireRole("HR");
  await connectToDatabase();

  const { id } = await params;
  const [employee, settings] = await Promise.all([
    Employee.findById(id).lean(),
    Settings.findOne({ singleton: "global" }).lean(),
  ]);

  if (!employee) {
    notFound();
  }

  const activeCount = await Employee.countDocuments({ status: "active" });
  const branches = (settings?.branches ?? []).map((branch) => ({
    id: String(branch._id),
    name: branch.name,
    address: branch.address ?? "",
    lat: branch.lat,
    lng: branch.lng,
    radius: branch.radius ?? 500,
  }));

  return (
    <div className="p-6 md:p-8">
      <EditEmployeeForm
        activeCount={activeCount}
        branches={branches}
        employee={{
          id: String(employee._id),
          name: employee.name,
          empCode: employee.empCode,
          email: employee.email,
          officialEmail: employee.officialEmail ?? "",
          phone: employee.phone,
          altPhone: employee.altPhone ?? "",
          department: employee.department,
          designation: employee.designation,
          gender: employee.gender ?? "",
          maritalStatus: employee.maritalStatus ?? "",
          numChildren: String(employee.numChildren ?? 0),
          dob: employee.dob ? new Date(employee.dob).toISOString().slice(0, 10) : "",
          joinDate: new Date(employee.joinDate).toISOString().slice(0, 10),
          residenceAddress: employee.residenceAddress ?? "",
          correspondenceAddress: employee.correspondenceAddress ?? "",
          salary: employee.salary != null ? String(employee.salary) : "",
          workingStatus: employee.workingStatus ?? "Full-time",
          leavesBenefit: employee.leavesBenefit ?? "Standard",
          daysWorking: String(employee.daysWorking ?? 5),
          branchId: employee.branchId ?? "",
          remarks: employee.remarks ?? "",
          status: employee.status === "inactive" ? "inactive" : "active",
          workLocation: {
            lat: String(employee.workLocation?.lat ?? ""),
            lng: String(employee.workLocation?.lng ?? ""),
            radius: String(employee.workLocation?.radius ?? 500),
          },
          leaveBalance: {
            CL: String(employee.leaveBalance?.CL ?? 12),
            SL: String(employee.leaveBalance?.SL ?? 6),
          },
          bankDetails: {
            bankName: employee.bankDetails?.bankName ?? "",
            accountHolderName: employee.bankDetails?.accountHolderName ?? "",
            accountNumber: employee.bankDetails?.accountNumber ?? "",
            ifscCode: employee.bankDetails?.ifscCode ?? "",
            passbookFileUrl: employee.bankDetails?.passbookFileUrl ?? "",
          },
          documents: {
            aadharUrl: employee.documents?.aadharUrl ?? "",
            panUrl: employee.documents?.panUrl ?? "",
            offerLetterUrl: employee.documents?.offerLetterUrl ?? "",
            offerAcceptanceUrl: employee.documents?.offerAcceptanceUrl ?? "",
            joiningLetterUrl: employee.documents?.joiningLetterUrl ?? "",
            employeeAgreementUrl: employee.documents?.employeeAgreementUrl ?? "",
            responsibilitiesLetterUrl: employee.documents?.responsibilitiesLetterUrl ?? "",
            dresscodeGuidelinesUrl: employee.documents?.dresscodeGuidelinesUrl ?? "",
            resignationFromLastOrgUrl: employee.documents?.resignationFromLastOrgUrl ?? "",
            resumeUrl: employee.documents?.resumeUrl ?? "",
            idUrl: employee.documents?.idUrl ?? "",
            upiScannerUrl: employee.documents?.upiScannerUrl ?? "",
          },
        }}
      />
    </div>
  );
}
