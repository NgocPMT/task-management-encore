import { and, eq } from "drizzle-orm";
import { db } from "../database";
import { usersToOrganizations } from "../schema";
import log from "encore.dev/log";

const MembershipRepository = {
  isMember: async (userId: string, orgId: number) => {
    log.trace(`ids: user: ${userId}, org: ${orgId}`);
    const membership = await db
      .select()
      .from(usersToOrganizations)
      .where(
        and(
          eq(usersToOrganizations.userId, userId),
          eq(usersToOrganizations.orgId, orgId)
        )
      );

    return membership.length > 0;
  },

  isAdmin: async (userId: string, orgId: number) => {
    const adminAuthorization = await db
      .select()
      .from(usersToOrganizations)
      .where(
        and(
          eq(usersToOrganizations.userId, userId),
          eq(usersToOrganizations.orgId, orgId),
          eq(usersToOrganizations.role, "admin")
        )
      );

    return adminAuthorization.length > 0;
  },
};

export default MembershipRepository;
