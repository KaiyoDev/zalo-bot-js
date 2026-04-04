import type { JsonObject } from "../types";

export class User {
  constructor(
    public readonly id: string,
    public readonly displayName?: string,
    public readonly accountName?: string,
    public readonly accountType?: string,
    public readonly isBot?: boolean,
    public readonly canJoinGroups?: boolean,
    public readonly raw?: JsonObject,
  ) {}

  static fromApi(data?: JsonObject): User | undefined {
    if (!data || typeof data.id !== "string") {
      return undefined;
    }

    return new User(
      data.id,
      typeof data.display_name === "string" ? data.display_name : undefined,
      typeof data.account_name === "string" ? data.account_name : undefined,
      typeof data.account_type === "string" ? data.account_type : undefined,
      typeof data.is_bot === "boolean" ? data.is_bot : undefined,
      typeof data.can_join_groups === "boolean" ? data.can_join_groups : undefined,
      data,
    );
  }
}
