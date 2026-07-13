import {
  boolean,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const identityProviders = pgTable("identity_providers", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),

  type: varchar("type", { length: 32 }).notNull(), // local | oidc | saml
  name: varchar("name", { length: 255 }).notNull(),
  enabled: boolean("enabled").notNull().default(true),

  configJson: jsonb("config_json")
    .$type<Record<string, unknown>>()
    .notNull()
    .default({}),

  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const userIdentities = pgTable("user_identities", {
  id: uuid("id").defaultRandom().primaryKey(),

  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  providerId: uuid("provider_id")
    .notNull()
    .references(() => identityProviders.id, { onDelete: "cascade" }),

  subject: varchar("subject", { length: 512 }).notNull(), // OIDC sub, SAML NameID, local username key
  email: varchar("email", { length: 255 }),

  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const passwordCredentials = pgTable("password_credentials", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),

  passwordHash: text("password_hash").notNull(),
  passwordAlgo: varchar("password_algo", { length: 32 })
    .notNull()
    .default("argon2id"),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const sessions = pgTable("sessions", {
  id: uuid("id").defaultRandom().primaryKey(),

  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),

  tokenHash: text("token_hash").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  lastSeenAt: timestamp("last_seen_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const authAuditLogs = pgTable("auth_audit_logs", {
  id: uuid("id").defaultRandom().primaryKey(),

  organizationId: uuid("organization_id").references(() => organizations.id, {
    onDelete: "cascade",
  }),

  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),

  eventType: varchar("event_type", { length: 64 }).notNull(), // login_success, login_failed, logout, sso_linked
  ipAddress: varchar("ip_address", { length: 128 }),
  userAgent: text("user_agent"),
  detailsJson: jsonb("details_json")
    .$type<Record<string, unknown>>()
    .notNull()
    .default({}),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const organizations = pgTable("organizations", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  deploymentMode: varchar("deployment_mode", {
    length: 32,
  })
    .notNull()
    .default("hosted"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  role: varchar("role", { length: 32 }).notNull().default("user"),
  status: varchar("status", { length: 32 }).notNull().default("active"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const resourceTypes = pgTable("resource_types", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
});

export const resources = pgTable("resources", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  resourceTypeId: uuid("resource_type_id")
    .notNull()
    .references(() => resourceTypes.id, { onDelete: "restrict" }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  location: varchar("location", { length: 255 }),
  active: boolean("active").notNull().default(true),
  metadataJson: jsonb("metadata_json")
    .$type<Record<string, unknown>>()
    .notNull()
    .default({}),
});

export const bookings = pgTable("bookings", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  resourceId: uuid("resource_id")
    .notNull()
    .references(() => resources.id, { onDelete: "restrict" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  startAt: timestamp("start_at", { withTimezone: true }).notNull(),
  endAt: timestamp("end_at", { withTimezone: true }).notNull(),
  status: varchar("status", { length: 32 }).notNull().default("confirmed"),
  purpose: text("purpose"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
});

export const maintenanceTickets = pgTable("maintenance_tickets", {
  id: uuid("id").defaultRandom().primaryKey(),

  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),

  resourceId: uuid("resource_id")
    .notNull()
    .references(() => resources.id, { onDelete: "restrict" }),

  title: varchar("title", { length: 255 }).notNull(),

  status: varchar("status", { length: 32 }).notNull().default("reported"), // reported | triaged | scheduled | in_progress | waiting_parts | completed

  priority: varchar("priority", { length: 32 }).notNull().default("medium"), // low | medium | high | critical

  summary: text("summary").notNull(),
  impact: text("impact").notNull(),

  blockingBookings: boolean("blocking_bookings").notNull().default(false),

  assigneeUserId: uuid("assignee_user_id").references(() => users.id, {
    onDelete: "set null",
  }),

  reportedByUserId: uuid("reported_by_user_id").references(() => users.id, {
    onDelete: "set null",
  }),

  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),

  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),

  completedAt: timestamp("completed_at", { withTimezone: true }),
});

export const bookingRules = pgTable("booking_rules", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  resourceId: uuid("resource_id").references(() => resources.id, {
    onDelete: "cascade",
  }),
  resourceTypeId: uuid("resource_type_id").references(() => resourceTypes.id, {
    onDelete: "cascade",
  }),
  ruleType: varchar("rule_type", { length: 64 }).notNull(),
  configJson: jsonb("config_json")
    .$type<Record<string, unknown>>()
    .notNull()
    .default({}),
});

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  actorUserId: uuid("actor_user_id").references(() => users.id, {
    onDelete: "set null",
  }),
  entityType: varchar("entity_type", { length: 64 }).notNull(),
  entityId: uuid("entity_id").notNull(),
  action: varchar("action", { length: 64 }).notNull(),
  beforeJson: jsonb("before_json").$type<Record<string, unknown> | null>(),
  afterJson: jsonb("after_json").$type<Record<string, unknown> | null>(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
