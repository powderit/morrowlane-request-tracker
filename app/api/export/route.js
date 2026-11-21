import { listRequests } from "../../../lib/store";
import { toCsv } from "../../../lib/csv";
import { serverError } from "../../../lib/http";

export const dynamic = "force-dynamic";

const EXPORT_COLUMNS = [
  "id",
  "created_at",
  "requester_name",
  "location",
  "description",
  "priority",
  "status",
];

export async function GET() {
  try {
    const requests = await listRequests();
    return new Response(toCsv(requests, EXPORT_COLUMNS), {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="morrowlane-requests.csv"',
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return serverError(error, "exporting requests");
  }
}
