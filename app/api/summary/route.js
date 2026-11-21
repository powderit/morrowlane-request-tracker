import { listRequests } from "../../../lib/store";
import { buildSummary } from "../../../lib/summary";
import { json, serverError } from "../../../lib/http";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const requests = await listRequests();
    return json(buildSummary(requests));
  } catch (error) {
    return serverError(error, "loading the summary");
  }
}
