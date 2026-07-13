import { ensureTestOrganization } from "./ensure-org.js";
import { ensureLocalLoginForTestOrg } from "./ensure-auth.js";
import { seedResourcesForTestOrg } from "./seed-resources.js";
import { seedBookingsForTestOrg } from "./seed-bookings.js";
import { seedMaintenanceForTestOrg } from "./seed-maintenance.js";

export async function seedAll() {
  const ctx = await ensureTestOrganization();

  await ensureLocalLoginForTestOrg(ctx);

  const resourceCtx = await seedResourcesForTestOrg(ctx);

  await seedBookingsForTestOrg(ctx, resourceCtx);
  await seedMaintenanceForTestOrg(ctx, resourceCtx);

  console.log("Seed complete");
}
