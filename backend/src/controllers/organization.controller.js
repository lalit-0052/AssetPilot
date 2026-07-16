import { Category, Department, Employee } from "../models/index.js";
import { createRecord, deleteRecord, listRecords, updateRecord } from "../services/dataSource.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import { requestedOrganization, scopeRecords } from "../utils/organizationScope.js";

const crud = (collection, model) => ({
  list: asyncHandler(async (req, res) => res.json(await listRecords(collection, model))),
  create: asyncHandler(async (req, res) => res.status(201).json(await createRecord(collection, model, req.body))),
  update: asyncHandler(async (req, res) => {
    const updated = await updateRecord(collection, model, req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: "Record not found" });
    res.json(updated);
  }),
  remove: asyncHandler(async (req, res) => {
    const deleted = await deleteRecord(collection, model, req.params.id);
    if (!deleted) return res.status(404).json({ message: "Record not found" });
    res.json(deleted);
  }),
});

export const getOrganization = asyncHandler(async (req, res) => {
  const organization = requestedOrganization(req);
  res.json({
    departments: await listRecords("departments", Department),
    categories: await listRecords("categories", Category),
    employees: scopeRecords(await listRecords("employees", Employee), organization),
  });
});

export const departmentController = crud("departments", Department);
export const categoryController = crud("categories", Category);
export const employeeController = crud("employees", Employee);