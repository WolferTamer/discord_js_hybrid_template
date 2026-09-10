import BaseComponent from "./BaseComponent.js";

/** Class representation of an Event */
export default class Event<T> extends BaseComponent<T> {
  public eventName: string;
  constructor(
    id: string,
    execute: (ctx: T) => Promise<void>,
    eventName: string,
  ) {
    super(id, execute);
    this.eventName = eventName;
  }
}
