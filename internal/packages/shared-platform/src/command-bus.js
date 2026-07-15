/**
 * Light command bus — register handlers by command type.
 */

export class CommandBus {
  constructor() {
    /** @type {Map<string, (command: object) => Promise<unknown>>} */
    this.handlers = new Map();
  }

  /**
   * @param {string} type
   * @param {(command: object) => Promise<unknown>} handler
   */
  register(type, handler) {
    this.handlers.set(type, handler);
  }

  /**
   * @param {{ type: string; payload?: object; metadata?: object }} command
   */
  async execute(command) {
    const handler = this.handlers.get(command.type);
    if (!handler) {
      throw new Error(`command_handler_missing:${command.type}`);
    }
    return handler(command);
  }
}

/**
 * @param {string} type
 * @param {object} [payload]
 * @param {object} [metadata]
 */
export function createCommand(type, payload = {}, metadata = {}) {
  return { type, payload, metadata };
}
