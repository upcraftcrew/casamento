import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "expirar reservas pendentes",
  { minutes: 5 },
  internal.checkout.expirePending,
  {}
);

export default crons;
