export function json(data, status = 200) {
  return Response.json(data, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export function serverError(error, what) {
  console.error(`Error while ${what}:`, error);
  return json({ error: `Something went wrong while ${what}. Please try again.` }, 500);
}

export async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return undefined;
  }
}
