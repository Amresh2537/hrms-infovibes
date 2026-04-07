import { hashPassword } from "@/lib/auth";
import User from "@/models/User";

function getAdminConfig() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD?.trim();
  const name = process.env.ADMIN_NAME?.trim() || "HR Admin";
  const syncPassword = process.env.ADMIN_SYNC_PASSWORD === "true";

  if (!email || !password) {
    return null;
  }

  return { email, password, name, syncPassword };
}

export async function ensureBootstrapAdmin() {
  const config = getAdminConfig();

  if (!config) {
    return;
  }

  const existing = await User.findOne({ email: config.email });

  if (!existing) {
    const hashed = await hashPassword(config.password);
    await User.create({
      name: config.name,
      email: config.email,
      password: hashed,
      role: "HR",
    });
    return;
  }

  const updates: Record<string, unknown> = {};

  if (existing.role !== "HR") {
    updates.role = "HR";
  }

  if (config.syncPassword) {
    updates.password = await hashPassword(config.password);
  }

  if (Object.keys(updates).length > 0) {
    await User.updateOne({ _id: existing._id }, { $set: updates });
  }
}
