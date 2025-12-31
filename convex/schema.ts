import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { paymentAttemptSchemaValidator } from "./paymentAttemptTypes";

export default defineSchema({
    users: defineTable({
      name: v.string(),
      // this the Clerk ID, stored in the subject JWT field
      externalId: v.string(),
    }).index("byExternalId", ["externalId"]),

    paymentAttempts: defineTable(paymentAttemptSchemaValidator)
      .index("byPaymentId", ["payment_id"])
      .index("byUserId", ["userId"])
      .index("byPayerUserId", ["payer.user_id"]),

    apiKeys: defineTable({
      userId: v.string(), // Clerk user ID
      name: v.string(), // User-friendly name for the key
      keyHash: v.string(), // Hashed version of the API key
      keyPrefix: v.string(), // First 8 chars for display (e.g., "uvos_1234...")
      lastUsed: v.optional(v.number()), // Timestamp of last usage
      createdAt: v.number(), // Timestamp of creation
      expiresAt: v.optional(v.number()), // Optional expiration timestamp
      isActive: v.boolean(), // Whether the key is active
    })
      .index("byUserId", ["userId"])
      .index("byKeyHash", ["keyHash"])
      .index("byKeyPrefix", ["keyPrefix"]),


    // Board definitions (3 boards per customer: Feature Requests, Bug Reports, Internal Roadmap)
    kanbanBoards: defineTable({
      apiKeyUserId: v.string(), // Customer who owns this board (Clerk user ID)
      name: v.string(), // "Feature Requests", "Bug Reports", "Internal Roadmap"
      slug: v.string(), // "feature-requests", "bug-reports", "internal-roadmap"
      description: v.optional(v.string()),
      isPublicViewOnly: v.boolean(), // true for Internal Roadmap
      order: v.number(), // Tab order in widget
      createdAt: v.number(),
    })
      .index("byApiKeyUserId", ["apiKeyUserId"])
      .index("byApiKeyUserIdAndSlug", ["apiKeyUserId", "slug"]),

    // Columns (4 per board: Backlog, In Progress, Review, Done)
    kanbanColumns: defineTable({
      boardId: v.id("kanbanBoards"),
      name: v.string(), // "Backlog", "In Progress", "Review", "Done"
      slug: v.string(), // "backlog", "in-progress", "review", "done"
      order: v.number(), // Left to right order
      canAddItems: v.boolean(), // true only for "Backlog" for end users
      createdAt: v.number(),
    })
      .index("byBoardId", ["boardId"])
      .index("byBoardIdAndOrder", ["boardId", "order"]),

    // Kanban items (cards)
    kanbanItems: defineTable({
      boardId: v.id("kanbanBoards"),
      columnId: v.id("kanbanColumns"),
      title: v.string(),
      description: v.optional(v.string()),
      createdByUserId: v.optional(v.string()), // Clerk user ID (null if created by admin via dashboard)
      createdByAdminId: v.optional(v.string()), // Clerk user ID if admin created via dashboard
      position: v.number(), // Fractional indexing for drag ordering
      voteCount: v.number(), // Denormalized for performance
      status: v.union(
        v.literal("backlog"),
        v.literal("in-progress"),
        v.literal("review"),
        v.literal("done")
      ),
      createdAt: v.number(),
      updatedAt: v.number(),
    })
      .index("byBoardId", ["boardId"])
      .index("byColumnId", ["columnId"])
      .index("byBoardIdAndColumnId", ["boardId", "columnId"])
      .index("byCreatedByUserId", ["createdByUserId"]),

    // Votes on items
    kanbanVotes: defineTable({
      itemId: v.id("kanbanItems"),
      clerkUserId: v.string(), // Clerk user ID who voted
      boardId: v.id("kanbanBoards"), // For efficient querying
      createdAt: v.number(),
    })
      .index("byItemId", ["itemId"])
      .index("byClerkUserId", ["clerkUserId"])
      .index("byItemIdAndClerkUserId", ["itemId", "clerkUserId"]) // Ensure one vote per user per item
      .index("byBoardId", ["boardId"]),

    // Widget customization (branding, colors, fonts)
    widgetCustomization: defineTable({
      apiKeyUserId: v.string(), // One customization per customer (Clerk user ID)

      // Branding
      logoUrl: v.optional(v.string()),
      companyName: v.optional(v.string()),
      widgetTitle: v.optional(v.string()),

      // Colors (hex codes)
      primaryColor: v.optional(v.string()), // Buttons, links, accents
      secondaryColor: v.optional(v.string()), // Secondary buttons
      backgroundColor: v.optional(v.string()), // Widget background
      cardBackgroundColor: v.optional(v.string()), // Card background
      textColor: v.optional(v.string()), // Primary text
      borderColor: v.optional(v.string()), // Borders and dividers

      // Dark mode colors (optional - falls back to light mode if not set)
      darkPrimaryColor: v.optional(v.string()),
      darkSecondaryColor: v.optional(v.string()),
      darkBackgroundColor: v.optional(v.string()),
      darkCardBackgroundColor: v.optional(v.string()),
      darkTextColor: v.optional(v.string()),
      darkBorderColor: v.optional(v.string()),

      // Typography
      fontFamily: v.optional(v.string()), // e.g., "Inter, sans-serif"
      fontSize: v.optional(v.string()), // Base font size (e.g., "14px")
      headingFontFamily: v.optional(v.string()),

      // Spacing & Layout
      borderRadius: v.optional(v.string()), // e.g., "8px"
      spacing: v.optional(v.string()), // Base spacing unit (e.g., "16px")

      // Custom CSS (advanced users)
      customCss: v.optional(v.string()),

      updatedAt: v.number(),
      createdAt: v.number(),
    })
      .index("byApiKeyUserId", ["apiKeyUserId"]),
  });