export const LOCATIONS = ["Minneapolis", "Chicago", "Denver", "Austin"];
export const PRIORITIES = ["Low", "Medium", "High", "Urgent"];
export const STATUSES = ["New", "In Progress", "Complete"];
export const MAX_DESCRIPTION = 500;
export const MAX_NAME = 100;

function clean(value) {
  return typeof value === "string" ? value.trim() : "";
}

// Returns { error } on failure, or { value } with the trimmed fields on success.
export function validateNewRequest(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { error: "Send the request as JSON with requester_name, location, description, and priority." };
  }

  const requester_name = clean(body.requester_name);
  const location = clean(body.location);
  const description = clean(body.description);
  const priority = clean(body.priority);

  if (!requester_name) return { error: "Requester name is required." };
  if (requester_name.length > MAX_NAME) {
    return { error: `Requester name must be ${MAX_NAME} characters or fewer.` };
  }
  if (!location) return { error: "Location is required." };
  if (!LOCATIONS.includes(location)) {
    return { error: "Location must be Minneapolis, Chicago, Denver, or Austin." };
  }
  if (!description) return { error: "Description is required." };
  if (description.length > MAX_DESCRIPTION) {
    return {
      error: `Description must be ${MAX_DESCRIPTION} characters or fewer (yours is ${description.length}).`,
    };
  }
  if (!priority) return { error: "Priority is required." };
  if (!PRIORITIES.includes(priority)) {
    return { error: "Priority must be Low, Medium, High, or Urgent." };
  }

  return { value: { requester_name, location, description, priority } };
}

export function validateStatus(body) {
  const status = body && typeof body === "object" ? clean(body.status) : "";
  if (!status) return { error: "Status is required." };
  if (!STATUSES.includes(status)) {
    return { error: "Status must be New, In Progress, or Complete." };
  }
  return { value: status };
}

export function parseId(raw) {
  if (!/^\d+$/.test(String(raw))) return null;
  const id = Number(raw);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}
