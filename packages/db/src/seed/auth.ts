import { and, eq } from "drizzle-orm";
import {
  db,
  identityProviders,
  organizations,
  passwordCredentials,
  users,
} from "../index.js";
import { hashPassword } from "../../../../apps/web/src/lib/server/auth/password";

async function main() {
  const organization = await db.query.organizations.findFirst({
    where: eq(organizations.slug, "test-uni"),
  });

  if (!organization) {
    throw new Error("Organization not found");
  }

  const user = await db.query.users.findFirst({
    where: and(
      eq(users.organizationId, organization.id),
      eq(users.email, "admin@testuni.edu"),
    ),
  });

  if (!user) {
    throw new Error("Admin user not found");
  }

  const existingProvider = await db.query.identityProviders.findFirst({
    where: and(
      eq(identityProviders.organizationId, organization.id),
      eq(identityProviders.type, "local"),
    ),
  });

  if (!existingProvider) {
    await db.insert(identityProviders).values({
      organizationId: organization.id,
      type: "local",
      name: "Local login",
      enabled: true,
      configJson: { allowPasswordLogin: true },
    });
  }

  const passwordHash = await hashPassword("changeme123");

  const existingCredential = await db.query.passwordCredentials.findFirst({
    where: eq(passwordCredentials.userId, user.id),
  });

  if (!existingCredential) {
    await db.insert(passwordCredentials).values({
      userId: user.id,
      passwordHash,
    });
  }

  console.log({
    organizationSlug: organization.slug,
    email: user.email,
    password: "changeme123",
  });

  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
