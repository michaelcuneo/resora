import { and, eq } from "drizzle-orm";
import { db } from "../client.js";
import { resourceTypes, resources } from "../schema.js";

async function ensureResourceType(organizationId: string, name: string) {
  let type = (
    await db
      .select()
      .from(resourceTypes)
      .where(
        and(
          eq(resourceTypes.organizationId, organizationId),
          eq(resourceTypes.name, name),
        ),
      )
  )[0];

  if (!type) {
    [type] = await db
      .insert(resourceTypes)
      .values({
        organizationId,
        name,
      })
      .returning();
  }

  return type;
}

async function ensureResource({
  organizationId,
  resourceTypeId,
  name,
  description,
  location,
  metadataJson,
}: {
  organizationId: string;
  resourceTypeId: string;
  name: string;
  description: string;
  location: string;
  metadataJson: Record<string, unknown>;
}) {
  let resource = (
    await db
      .select()
      .from(resources)
      .where(
        and(
          eq(resources.organizationId, organizationId),
          eq(resources.name, name),
        ),
      )
  )[0];

  if (!resource) {
    [resource] = await db
      .insert(resources)
      .values({
        organizationId,
        resourceTypeId,
        name,
        description,
        location,
        metadataJson,
      })
      .returning();
  }

  return resource;
}

export async function seedResourcesForTestOrg({
  organization,
}: {
  organization: { id: string };
}) {
  const roomType = await ensureResourceType(organization.id, "Room");
  const equipmentType = await ensureResourceType(organization.id, "Equipment");

  await ensureResource({
    organizationId: organization.id,
    resourceTypeId: roomType.id,
    name: "Room B204",
    description: "Teaching room with projector",
    location: "Building B · Level 2",
    metadataJson: {
      capacity: 32,
      features: ["Projector", "Whiteboard"],
    },
  });

  await ensureResource({
    organizationId: organization.id,
    resourceTypeId: roomType.id,
    name: "Room A110",
    description: "Large lecture room",
    location: "Building A · Level 1",
    metadataJson: {
      capacity: 48,
      features: ["Display", "Lectern audio"],
    },
  });

  await ensureResource({
    organizationId: organization.id,
    resourceTypeId: equipmentType.id,
    name: "Canon C300 Kit 03",
    description: "Cinema camera kit",
    location: "Media cage",
    metadataJson: {
      kit: "camera",
      features: ["Battery kit", "Media cards"],
    },
  });

  await ensureResource({
    organizationId: organization.id,
    resourceTypeId: equipmentType.id,
    name: "Tripod Kit 07",
    description: "Heavy-duty tripod kit",
    location: "Media cage",
    metadataJson: {
      kit: "tripod",
    },
  });

  const seededResources = await db
    .select()
    .from(resources)
    .where(eq(resources.organizationId, organization.id));

  return {
    roomType,
    equipmentType,
    resources: seededResources,
  };
}
