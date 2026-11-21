import { updateStatus } from "../../../../lib/store";
import { validateStatus, parseId } from "../../../../lib/validate";
import { json, serverError, readJson } from "../../../../lib/http";

export const dynamic = "force-dynamic";

export async function PATCH(request, { params }) {
  try {
    const { id: rawId } = await params;
    const id = parseId(rawId);
    if (!id) return json({ error: `No request found with id ${rawId}.` }, 404);

    const body = await readJson(request);
    const { error, value } = validateStatus(body);
    if (error) return json({ error }, 400);

    const updated = await updateStatus(id, value);
    if (!updated) return json({ error: `No request found with id ${id}.` }, 404);

    return json({ request: updated });
  } catch (error) {
    return serverError(error, "updating the status");
  }
}
