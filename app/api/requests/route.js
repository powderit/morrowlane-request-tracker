import { listRequests, createRequest } from "../../../lib/store";
import { validateNewRequest } from "../../../lib/validate";
import { json, serverError, readJson } from "../../../lib/http";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const requests = await listRequests();
    return json({ requests });
  } catch (error) {
    return serverError(error, "loading requests");
  }
}

export async function POST(request) {
  try {
    const body = await readJson(request);
    const { error, value } = validateNewRequest(body);
    if (error) return json({ error }, 400);

    const saved = await createRequest(value);
    return json({ request: saved }, 201);
  } catch (error) {
    return serverError(error, "saving the request");
  }
}
