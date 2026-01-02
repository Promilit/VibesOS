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


    // Projects (formerly kanbanBoards) - dynamic project creation
    projects: defineTable({
      userId: v.string(), // Project owner (Clerk user ID)
      name: v.string(), // User-defined project name
      slug: v.string(), // Auto-generated from name
      description: v.optional(v.string()),
      isPublicViewOnly: v.boolean(), // Can widget users submit items?
      apiKeyId: v.optional(v.id("apiKeys")), // Link to API key (required for widget access)
      enabledBoards: v.optional(v.array(v.string())), // ["feature-requests", "bug-reports", "internal-roadmap"]
      createdAt: v.number(),
      updatedAt: v.number(),
    })
      .index("byUserId", ["userId"])
      .index("byUserIdAndSlug", ["userId", "slug"]),

    // Project boards - each project has up to 3 boards (Feature Requests, Bug Reports, Internal Roadmap)
    projectBoards: defineTable({
      projectId: v.id("projects"),
      boardType: v.union(
        v.literal("feature-requests"),
        v.literal("bug-reports"),
        v.literal("internal-roadmap")
      ),
      name: v.string(), // "Feature Requests", "Bug Reports", "Internal Roadmap"
      isVisible: v.boolean(), // Can be hidden by admin
      order: v.number(), // Tab order (0, 1, 2)
      createdAt: v.number(),
    })
      .index("byProjectId", ["projectId"])
      .index("byProjectIdAndType", ["projectId", "boardType"]),

    // Project columns (formerly kanbanColumns)
    projectColumns: defineTable({
      projectId: v.id("projects"),
      boardId: v.optional(v.id("projectBoards")), // Which board this column belongs to (optional for backward compat)
      name: v.string(), // "Backlog", "In Progress", "Review", "Done"
      slug: v.string(), // "backlog", "in-progress", "review", "done"
      order: v.number(), // Left to right order
      canAddItems: v.boolean(), // true only for "Backlog" for end users
      createdAt: v.number(),
    })
      .index("byProjectId", ["projectId"])
      .index("byProjectIdAndOrder", ["projectId", "order"])
      .index("byBoardId", ["boardId"]),

    // Project items (formerly kanbanItems)
    projectItems: defineTable({
      projectId: v.id("projects"),
      boardId: v.optional(v.id("projectBoards")), // Which board this item belongs to (optional for backward compat)
      columnId: v.id("projectColumns"),
      title: v.string(),
      description: v.optional(v.string()),
      createdByUserId: v.optional(v.string()), // Clerk user ID (widget user)
      createdByAdminId: v.optional(v.string()), // Clerk user ID (admin via dashboard)
      position: v.number(), // Fractional indexing for drag ordering
      voteCount: v.number(), // Denormalized for performance
      commentCount: v.number(), // Denormalized for performance
      status: v.union(
        v.literal("backlog"),
        v.literal("in-progress"),
        v.literal("review"),
        v.literal("done")
      ),
      createdAt: v.number(),
      updatedAt: v.number(),
    })
      .index("byProjectId", ["projectId"])
      .index("byColumnId", ["columnId"])
      .index("byProjectIdAndColumnId", ["projectId", "columnId"])
      .index("byBoardId", ["boardId"])
      .index("byCreatedByUserId", ["createdByUserId"]),

    // Project votes (formerly kanbanVotes)
    projectVotes: defineTable({
      itemId: v.id("projectItems"),
      clerkUserId: v.string(), // Clerk user ID who voted
      projectId: v.id("projects"), // For efficient querying
      createdAt: v.number(),
    })
      .index("byItemId", ["itemId"])
      .index("byClerkUserId", ["clerkUserId"])
      .index("byItemIdAndClerkUserId", ["itemId", "clerkUserId"]) // Ensure one vote per user per item
      .index("byProjectId", ["projectId"]),

    // Project customization (formerly widgetCustomization) - now per-project
    projectCustomization: defineTable({
      projectId: v.id("projects"), // One customization per project

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
      .index("byProjectId", ["projectId"]),

    // Project comments - threaded comments on items
    projectComments: defineTable({
      itemId: v.id("projectItems"),
      projectId: v.id("projects"), // For efficient querying
      authorId: v.string(), // Clerk user ID
      authorType: v.union(v.literal("admin"), v.literal("user")), // Admin or widget user
      content: v.string(),
      parentCommentId: v.optional(v.id("projectComments")), // For threaded replies
      isDeleted: v.boolean(), // Soft delete
      createdAt: v.number(),
      updatedAt: v.number(),
    })
      .index("byItemId", ["itemId"])
      .index("byProjectId", ["projectId"])
      .index("byAuthorId", ["authorId"])
      .index("byParentCommentId", ["parentCommentId"])
      .index("byItemIdAndCreatedAt", ["itemId", "createdAt"]), // For chronological listing

    // Project analytics - daily aggregated metrics
    projectAnalytics: defineTable({
      projectId: v.id("projects"),
      date: v.string(), // YYYY-MM-DD format for daily aggregation

      // Aggregate metrics
      totalItems: v.number(),
      totalVotes: v.number(),
      totalComments: v.number(),
      activeUsers: v.number(), // Unique users who voted/commented
      newItemsCount: v.number(),
      newVotesCount: v.number(),
      newCommentsCount: v.number(),

      // Status breakdown
      itemsBacklog: v.number(),
      itemsInProgress: v.number(),
      itemsReview: v.number(),
      itemsDone: v.number(),

      createdAt: v.number(),
    })
      .index("byProjectId", ["projectId"])
      .index("byProjectIdAndDate", ["projectId", "date"]),
  });
