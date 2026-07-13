import { eq } from "drizzle-orm";
import { db } from "../client.js";
import { bookings } from "../schema.js";

export async function seedBookingsForTestOrg(
  {
    organization,
    admin,
  }: {
    organization: { id: string };
    admin: { id: string };
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
  const roomB204 = resources.find((resource) => resource.name === "Room B204");
  const canonC300 = resources.find(
    (resource) => resource.name === "Canon C300 Kit 03",
  );

  if (!roomB204 || !canonC300) {
    throw new Error("Required seeded resources were not found");
  }

  const existingBookings = await db
    .select()
    .from(bookings)
    .where(eq(bookings.organizationId, organization.id));

  if (existingBookings.length > 0) {
    return;
  }

  const now = Date.now();

  await db.insert(bookings).values([
    {
      organizationId: organization.id,
      resourceId: roomB204.id,
      userId: admin.id,
      startAt: new Date(now + 1000 * 60 * 60 * 2),
      endAt: new Date(now + 1000 * 60 * 60 * 4),
      status: "confirmed",
      purpose: "Lecture",
    },
    {
      organizationId: organization.id,
      resourceId: canonC300.id,
      userId: admin.id,
      startAt: new Date(now + 1000 * 60 * 60 * 6),
      endAt: new Date(now + 1000 * 60 * 60 * 8),
      status: "confirmed",
      purpose: "Filming practical",
    },
  ]);
}
