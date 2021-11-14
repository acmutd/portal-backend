import { IUserDocument } from "./users.types";

export async function addProvider(this: IUserDocument, provider: { provider: string; token: string }) {
  this.providers.push(provider);
  await this.save();
}

export async function endMostRecentMembership(this: IUserDocument) {
  this.membership_history[0].end_timestamp = new Date();
  await this.save();
}

export async function addNewMembership(this: IUserDocument, newMembership: { program: string; start_timestamp: Date }) {
  this.membership_history = [newMembership, ...this.membership_history];
  await this.save();
}

export async function addRole(this: IUserDocument, newRole: string) {
  this.role.push(newRole);
  await this.save();
}

export async function removeRole(this: IUserDocument, removedRole: string) {
  this.role = this.role.filter((r) => r !== removedRole);
  await this.save();
}

export async function addApplication(this: IUserDocument, applicationName: string) {
  this.submitted_applications.push({
    application_id: "",
    name: applicationName,
    timestamp: new Date(),
  });
  await this.save();
}

export async function attendEvent(this: IUserDocument, newEvent: { event_id: string; name: string; timestamp: Date }) {
  this.attended_events.push(newEvent);
  await this.save();
}

export async function addSticker(this: IUserDocument, newSticker: { sticker_id: string }) {
  this.stickers.push(newSticker);
  await this.save();
}
