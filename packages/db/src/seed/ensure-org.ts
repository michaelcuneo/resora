import { and, eq } from "drizzle-orm";
import { db } from "../client.js";
import { organizations, users } from "../schema.js";

export async function ensureTestOrganization() {
  let organization = (
    await db
      .select()
      .from(organizations)
      .where(eq(organizations.slug, "test-uni"))
  )[0];

  if (!organization) {
    [organization] = await db
      .insert(organizations)
      .values({
        name: "Test University",
        slug: "test-uni",
      })
      .returning();
  }

  let admin = (
    await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.organizationId, organization.id),
          eq(users.email, "admin@testuni.edu"),
        ),
      )
  )[0];

  if (!admin) {
    [admin] = await db
      .insert(users)
      .values({
        organizationId: organization.id,
        name: "Admin User",
        email: "admin@testuni.edu",
        role: "admin",
      })
      .returning();
  }

  return { organization, admin };
}
