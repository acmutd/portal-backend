import { IEventDocument } from "./event.types";
import { Person } from "./event.types";

export async function addReserved(this: IEventDocument, newPerson: Person) {
  if (!this.reserved) this.reserved = [newPerson];
  else this.reserved.push(newPerson);
  await this.save();
}

export async function addAttended(this: IEventDocument, newPerson: Person) {
  if (!this.attended) this.attended = [newPerson];
  else this.attended.push(newPerson);
  await this.save();
}
