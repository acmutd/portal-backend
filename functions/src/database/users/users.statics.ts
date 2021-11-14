import { IUserDocument, IUserModel } from "./users.types";

export async function findByMembershipStatus(this: IUserModel, membershipStatus: boolean): Promise<IUserDocument[]> {
  const data = await this.find({ membership: membershipStatus });
  return data;
}
