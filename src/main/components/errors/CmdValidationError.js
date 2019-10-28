export class CmdValidationError extends Error {
  /**
   * @param {String} cmd Command name 
   * @param {String} msg Error msg
   */
  constructor(cmd, msg) {
      super(`${cmd}: ${msg}`);
      this.type = 'CmdValidationError';
  }
}
