export class InputHelper {

  static trim(input) {
    return input.map(e => {
      if (e.charAt(0) === '"' && e.charAt(e.length - 1) === '"') {
        return e.substr(1, e.length - 2);
      } else {
        return e;
      }
    });
  }

  /**
   * If commands are piped, process array > string > array
   * Return an array of arrays (even on single command)
   *
   * @param {String[]} input
   * @returns {String[][]}
   */
  static sanitize(input) {
    const preparedInput = InputHelper.trim(input)
    if (preparedInput.indexOf('|') !== -1) {
      let splitArray = InputHelper.splitArrayOnPipe(preparedInput);
      let argumentArray = InputHelper.makeArgumentArray(splitArray);
      let filteredArray = InputHelper.filterEmptyArgs(argumentArray);
      return filteredArray;
    } else {
      return [preparedInput];
    }
  }

  /**
   * Rejoin array, split on pipes
   *
   * @param {String[]} cmdInput
   * @returns {String[]}
   */
  static splitArrayOnPipe(cmdInput) {
    let joinedInput = cmdInput.join(" ");
    let pipeSplit = joinedInput.split("|");
    let inputStrings = pipeSplit.map(item => item.trim());
    return inputStrings;
  }

  /**
   *
   * @param {String[]} commandArray
   * @returns {String[][]}
   */
  static makeArgumentArray(commandArray) {
    let argumentArray = commandArray.map(item => {
      if (item.indexOf(" ") === -1) {
        return [item];
      } else {
        return item.split(" ");
      }
    });
    return argumentArray;
  }

  /**
   *
   * @param {String[]} commandArray
   * @returns {String[][]}
   */
  static filterEmptyArgs(commandArray) {
    return commandArray.filter(
      item => item.length >= 1 && item[0].length > 0
    );
  }

}