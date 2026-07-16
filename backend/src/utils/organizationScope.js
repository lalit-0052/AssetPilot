export const requestedOrganization = (req) => req.query.organization || req.body.organization;

export const sameOrganization = (item, organization) => {
  if (!organization) return true;
  return item.organization === organization;
};

export const scopeRecords = (records, organization) => records.filter((item) => sameOrganization(item, organization));