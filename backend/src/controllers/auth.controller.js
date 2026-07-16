import { createRecord, listRecords } from "../services/dataSource.service.js";
import { Employee } from "../models/employee.model.js";
import asyncHandler from "../utils/asyncHandler.js";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const adminUser = {
  id: "admin-1",
  name: "AssetFlow Admin",
  email: "admin@assetflow.com",
  password: "Admin@123",
  organization: "AssetFlow Demo Org",
  role: "Admin",
};

export const login = asyncHandler(async (req, res) => {
  const { email, password, organization, loginType } = req.body;
  if (!email || !password || !organization) return res.status(400).json({ message: "Email, password, and organization are required" });
  if (!emailRegex.test(email)) return res.status(400).json({ message: "Enter a valid email address" });

  if (loginType === "admin") {
    if (email === adminUser.email && password === adminUser.password && organization === adminUser.organization) {
      return res.json({ user: { id: adminUser.id, name: adminUser.name, email: adminUser.email, organization: adminUser.organization, role: adminUser.role } });
    }

    const employees = await listRecords("employees", Employee);
    const admin = employees.find((item) => item.email === email && item.password === password && item.organization === organization && item.role === "Admin");
    if (!admin) return res.status(401).json({ message: "Invalid admin credentials" });
    return res.json({ user: { id: admin.id, name: admin.name, email: admin.email, organization: admin.organization, role: "Admin" } });
  }

  const employees = await listRecords("employees", Employee);
  const employee = employees.find((item) => item.email === email && item.password === password && item.organization === organization && item.role === "Employee");
  if (!employee) return res.status(401).json({ message: "Invalid employee credentials" });
  return res.json({ user: { id: employee.id, name: employee.name, email: employee.email, organization: employee.organization, role: "Employee", department: employee.department } });
});

export const createEmployeeAccount = asyncHandler(async (req, res) => {
  const { name, email, password, organization, department, role = "Employee" } = req.body;
  if (!name || !email || !password || !organization) return res.status(400).json({ message: "Name, email, password, and organization are required" });
  if (!emailRegex.test(email)) return res.status(400).json({ message: "Enter a valid email address" });
  if (password.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters" });
  if (!["Admin", "Employee"].includes(role)) return res.status(400).json({ message: "Invalid account type" });

  const employees = await listRecords("employees", Employee);
  if (employees.some((item) => item.email === email)) return res.status(409).json({ message: "Employee account already exists" });

  const employee = await createRecord("employees", Employee, {
    name,
    email,
    password,
    organization,
    department: department || "Unassigned",
    role,
    status: "Active",
  });

  if (role === "Employee") {
    await createRecord("notifications", null, {
      type: "Alerts",
      audience: "Admin",
      organization,
      text: `${name} created an employee account for ${organization}`,
      age: "just now",
    });
  }

  res.status(201).json({ user: { id: employee.id, name: employee.name, email: employee.email, organization: employee.organization, role: employee.role, department: employee.department } });
});