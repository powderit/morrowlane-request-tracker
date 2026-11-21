// Works out the three summary tiles from a list of requests.
export function buildSummary(requests) {
  const open = requests.filter((r) => r.status !== "Complete");

  // "This month" = the calendar month (UTC) of the most recent request in the data.
  let latest = null;
  for (const r of requests) {
    const date = new Date(r.created_at);
    if (!isNaN(date) && (!latest || date > latest)) latest = date;
  }

  const completed_this_month = latest
    ? requests.filter((r) => {
        const date = new Date(r.created_at);
        return (
          r.status === "Complete" &&
          date.getUTCFullYear() === latest.getUTCFullYear() &&
          date.getUTCMonth() === latest.getUTCMonth()
        );
      }).length
    : 0;

  return {
    open_requests: open.length,
    urgent_open: open.filter((r) => r.priority === "Urgent").length,
    completed_this_month,
  };
}
