import mongoose from "mongoose";
import {
  assets,
  auditCycles,
  bookings,
  categories,
  departments,
  employees,
  maintenanceRequests,
  notifications,
} from "../data/seedData.js";

const clone = (value) => JSON.parse(JSON.stringify(value));

const withIds = (items, prefix) =>
  clone(items).map((item, index) => ({
    id: item.id || `${prefix}-${index + 1}`,
    ...item,
  }));

const memoryStore = {
  assets: withIds(assets, "asset"),
  auditCycles: withIds(auditCycles, "audit"),
  bookings: withIds(bookings, "booking"),
  categories: withIds(categories, "category"),
  departments: withIds(departments, "department"),
  employees: withIds(employees, "employee"),
  maintenanceRequests: withIds(maintenanceRequests, "maintenance"),
  notifications: withIds(notifications, "notification"),
};

const normalizeDocument = (document) => {
  const item = document.toObject ? document.toObject() : document;
  return {
    id: item._id?.toString?.() || item.id,
    ...item,
  };
};

export const hasMongoConnection = () => mongoose.connection.readyState === 1;

export const listRecords = async (collection, model) => {
  if (!hasMongoConnection() || !model) return memoryStore[collection];
  const documents = await model.find().lean();
  return documents.map(normalizeDocument);
};

export const createRecord = async (collection, model, payload) => {
  if (hasMongoConnection() && model) {
    const document = await model.create(payload);
    return normalizeDocument(document);
  }

  const item = { id: `${collection}-${Date.now()}`, createdAt: new Date().toISOString(), ...payload };
  memoryStore[collection].unshift(item);
  return item;
};

export const deleteRecord = async (collection, model, id) => {
  if (hasMongoConnection() && model) {
    const deleted = await model.findByIdAndDelete(id).lean();
    return deleted ? normalizeDocument(deleted) : null;
  }

  const index = memoryStore[collection].findIndex((item) => item.id === id || item.tag === id);
  if (index === -1) return null;
  const [deleted] = memoryStore[collection].splice(index, 1);
  return deleted;
};

export const updateRecord = async (collection, model, id, payload) => {
  if (hasMongoConnection() && model) {
    const updated = await model.findByIdAndUpdate(id, payload, { new: true, runValidators: true }).lean();
    return updated ? normalizeDocument(updated) : null;
  }

  const index = memoryStore[collection].findIndex((item) => item.id === id || item.tag === id);
  if (index === -1) return null;
  memoryStore[collection][index] = { ...memoryStore[collection][index], ...payload };
  return memoryStore[collection][index];
};