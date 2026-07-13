import { eq } from "drizzle-orm";
import { db } from "../client.js";
import { maintenanceTickets } from "../schema";

export async function seedMaintenanceForTestOrg(
  {
    organization,
  }: {
    organization: { id: string };
  },
  {
    resources,
  }: {
    resources: Array<{
      id: string;
      name: string;
      organizationId: string;
    }>;
  },
) {
  const roomA110 = resources.find((resource) => resource.name === "Room A110");
  const tripodKit = resources.find(
    (resource) => resource.name === "Tripod Kit 07",
  );

  if (!roomA110 || !tripodKit) {
    throw new Error("Required seeded resources were not found");
  }

  const existingTickets = await db
    .select()
    .from(maintenanceTickets)
    .where(eq(maintenanceTickets.organizationId, organization.id));

  if (existingTickets.length > 0) {
    return;
  }

  await db.insert(maintenanceTickets).values([
    {
      organizationId: organization.id,
      resourceId: roomA110.id,
      title: "Projector lamp failure",
      status: "reported",
      priority: "high",
      summary: "Projector shuts off after a few minutes of use.",
      impact: "Teaching room cannot be used for presentations.",
      blockingBookings: true,
    },
    {
      organizationId: organization.id,
      resourceId: tripodKit.id,
      title: "Tripod leg lock broken",
      status: "triaged",
      priority: "medium",
      summary: "Front leg slips under load and no longer locks reliably.",
      impact: "Unsafe for camera use.",
      blockingBookings: true,
    },
  ]);
}
