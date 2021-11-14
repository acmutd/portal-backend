import { IResumeDocument } from "./resume.types";

export async function setGraduating(this: IResumeDocument, newGraduating: string) {
  this.graduating = newGraduating;
  await this.save();
}

export async function addRole(this: IResumeDocument, newRole: string): Promise<void> {
  this.role.push(newRole);
  await this.save();
}

export async function removeRole(this: IResumeDocument, removedRole: string) {
  this.role = this.role.filter((r) => r !== removedRole);
  await this.save();
}

export async function setFileId(this: IResumeDocument, newFileId: string) {
  this.file_id = newFileId;
  await this.save();
}
