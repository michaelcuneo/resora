import { and, eq } from "drizzle-orm";
import { db } from "../client.js";
import { identityProviders, passwordCredentials } from "../schema.js";
import { hashPassword } from "../../../../apps/web/src/lib/server/auth/password.js";

export async function ensureLocalLoginForTestOrg({
  organization,
  admin,
}: {
  organization: { id: string; slug: string };
  admin: { id: string; email: string };
}) {
  const existingProvider = (
    await db
      .select()
      .from(identityProviders)
      .where(
        and(
          eq(identityProviders.organizationId, organization.id),
          eq(identityProviders.type, "local"),
        ),
      )
  )[0];

  if (!existingProvider) {
    await db.insert(identityProviders).values({
      organizationId: organization.id,
      type: "local",
      name: "Local login",
      enabled: true,
      configJson: { allowPasswordLogin: true },
    });
  }

  const existingCredential = (
    await db
      .select()
      .from(passwordCredentials)
      .where(eq(passwordCredentials.userId, admin.id))
  )[0];

  if (!existingCredential) {
    const passwordHash = await hashPassword("changeme123");

    await db.insert(passwordCredentials).values({
      userId: admin.id,
      passwordHash,
    });
  }

  console.log({
    organizationSlug: organization.slug,
    email: admin.email,
    password: "changeme123",
  });
}
