class TerminalUtilities {
  /**
   * Function parsing path for commands like: cmd [flags] [path]
   * Parse absolute and relative paths. If relative - takes current dir
   * and resolves with '..' notation
   * 
   * @param {String[]} args Args in format ['cmd', 'flag1', 'flag2', 'path']
   * @returns {Object} root
   * @returns {FsUnit} [root.listingUnit] Dir or File
   * @returns {String} root.path
   */
  static getFsUnit(args) {
    let listingUnit = term.tmp_fs.pointer;
    const path = args.slice(1).filter(it => it.indexOf('-') !== 0)[0] || '.'; 
    if (args.length > 1) {
        if (path !== '.') {
            const startDir = path.indexOf('/') === 0 ? 
                '/' : 
                term.tmp_fs.pwd();
            const preparedPath = term.pathMgr.resolveToArray(startDir, path);
            listingUnit = term.tmp_fs.get(preparedPath);
            if (!listingUnit) {
                return {
                    path
                };
            }
        }
    }
    return {
        listingUnit,
        path
    };
  }

 /**
  * Take every element from arg array with dash '-',
  * remove duplicates and invalid flags
  * 
  * @param {String[]} args In format ['ls', '-la', '/'] 
  * @param {String[]} supportedFlagsList Such as ['a', 'l]
  * @returns {Set}
  */
  static parseFlags(args, supportedFlagsList) {
    return new Set(
        args
        .filter(option => option.indexOf('-') === 0)
        .map(option => option.replace('-', ''))
        .join('')
        .split('')
        .filter(option => supportedFlagsList.includes(option))
    );
  }


 /**
  * Format date to DD MMM HH:mm
  * 
  * @param {Date} date Js Date type
  * @returns {String}
  */
  static formatDate(date) {
    const [
        _weekDay,
        day,
        mon,
        _year,
        time
    ] = date.toUTCString().split(' ');
    return [day, mon, time.split(':').slice(0, -1).join(':')].join(' ');
  }

 /**
  * Render for ls -l flag
  * 
  * @param {FsUnit} fsUnit File, Dir or Link
  * @returns {String}
  */
  static lsRenderFullLine(fsUnit) {
    const unitType = fsUnit.isFile() ? '-' : 'd';
    return `<span>${unitType}rw-r--r--</span>&nbsp;&nbsp;` +
        `<span>11</span>&nbsp;&nbsp;` +
        `<span>guest</span>&nbsp;&nbsp;` +
        `<span>guest</span>&nbsp;&nbsp;` +
        `<span>${fsUnit.size}</span>&nbsp;&nbsp;` +
        `<span>${TerminalUtilities.formatDate(new Date(fsUnit.lastMod))}</span>&nbsp;&nbsp;` +
        `<span class='filesystem-${fsUnit.type}'>${fsUnit.name}</span>`;
  }

 /**
  * Render for default ls
  * 
  * @param {FsUnit} fsUnit File, Dir or Link
  * @returns {String}
  */
  static lsRenderOneLine(fsUnit) {
    return `<span class='filesystem-${fsUnit.type}'>${fsUnit.name}</span>`;
  }
}


class CmdValidationError extends Error {
  /**
   * @param {String} cmd Command name 
   * @param {String} msg Error msg
   */
  constructor(cmd, msg) {
      super(`${cmd}: ${msg}`);
      this.type = 'CmdValidationError';
  }
}
