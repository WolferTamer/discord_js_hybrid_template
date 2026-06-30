import BaseComponent from "./BaseComponent.js";

/** Class representation of an Event */
export default class Event extends BaseComponent {
  public eventName: string;
  constructor(id: string, execute: () => Promise<void>, eventName: string) {
    super(id, execute);
    this.eventName = eventName;
  }
}
