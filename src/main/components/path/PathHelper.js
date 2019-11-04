export class PathHelper {
  /**
   *
   * @param {String} path1
   * @param {String} path2 Unix-like path. Absolute or relative
   * @returns {String[]}
   */
  static resolveToArray(path1, path2) {
      const goingBackwardsSymb = '..';
      const mainPath = path1.split('/').filter(it => it.length);
      const foreignPath = path2.split('/').filter(it => it.length);

      if (foreignPath.includes('..')) {
          foreignPath.forEach(pathElement => {
              if (pathElement !== goingBackwardsSymb) {
                  mainPath.push(pathElement);
              } else {
                  if (!mainPath[mainPath.length - 1]) {
                      throw new Error('Invalid path');
                  }
                  mainPath.pop();
              }
          });
          return mainPath;
      } else {
          return mainPath.concat(foreignPath);
      }
  }

  /**
   * Determine if the passed value is the proper format for a directory.
   */
  static isValidDirectory(filename) {
      if (filename == '') {
          return false;
      }
      var newFilename = filename.replace(/[^A-Za-z\d\.\-_~]/, '');   // Remove all but allowed chars.
      if (newFilename.length != filename.length) {
          return false;
      }
      // Check for more than 1 period in a row. TODO: Do we even need this protection? Don't want people creating a dir called '..'.
      var foundPeriods = newFilename.match(/\.\./g);
      if (foundPeriods != null && foundPeriods.length > 1) {
          return false;
      }
      return true;
  }

  /**
   * Determine if the passed value is the proper format for a file name.
   */
  static isValidFilename(filename) {
      if (filename == '') {
          return false;
      }
      var newFilename = filename.replace(/[^A-Za-z\d\.\-_~]/, '');   // Remove all but allowed chars.
      if (newFilename.length != filename.length) {
          return false;
      }
      // Check for more than 1 period in a row. TODO: Do we even need this protection? Don't want people creating a dir called '..'.
      var foundPeriods = newFilename.match(/\.\./g);
      if (foundPeriods != null && foundPeriods.length > 1) {
          return false;
      }
      return true;
  }

  /**
   * Determine if the passed value is the proper format for a directory path (no file name at end).
   */
  static isValidDirectoryPath(filename) {
      if (filename == '') {
          return false;
      }
      var newFilename = filename.replace(/[^A-Za-z\d\/\-_~]/, '');   // Remove all but allowed chars.
      newFilename = newFilename.replace(/(\/)\/+/g, "$1");    // Remove any double slashes.
      if (newFilename.length != filename.length) {
          return false;
      }
      return true;
  }

  /**
   * Get the directory part of a filepath. What's before the final slash. Add a final slash if not there.
   * assumeDirectory - if true, no slashes means assume it's meant to be a directory name.
   */
  static getDirectoryPart(filepath, assumeDirectory) {
      var dirs = '';
      if (filepath == '') {
          return false;
      }
      if (assumeDirectory && this.isValidDirectory(filepath)) {
          dirs = filepath;
      } else if (!assumeDirectory && this.isValidFilename(filepath)) {
          return false;
      } else {
          dirs = filepath.substring(0, filepath.lastIndexOf("/"));  // The path without the trailing portion.
      }
      return dirs + "/";
  }

  /**
   * Get the ending part of a filepath (the filename). What's after the final slash.
   * assumeFile - if true, no slashes means assume it's meant to be a directory name.
   */
  static getFilenamePart(filepath, assumeFile) {
      if (filepath == '') {
          return false;
      }
      if (assumeFile && this.isValidFilename(filepath)) {
          return filepath;
      } else if (!assumeFile && this.isValidDirectory(filepath)) {
          return false;
      }
      var name = filepath.split('\\').pop().split('/').pop(); // Get the final part (file name).
      if (name == '') {
          return false;
      }
      return name;
  }

  /**
   * Parse a path into a selector for finding a directory node.
   */
  static parseDirPathToSelector(path) {
      if (path == "/" || path == "~") {
          return "d[path='/'][name='/']";
      }
      path = path.replace(/\/+$/, "");  // Remove trailing slash.
      var name = path.split('\\').pop().split('/').pop();  // Get the last part - either a file name or a dir name without a trailing slash.
      var dirs = path.substring(0, path.lastIndexOf("/") + 1);  // The path without the trailing portion.
      return "d[path='" + dirs + name + "/'][name='" + name + "']";  // Create a node selector for a directory.
  }

  /**
   * Parse a path with filename into a selector for finding a file node.
   */
  static parseFilePathToSelector(path) {
      var name = path.split('\\').pop().split('/').pop(); // Get the final part (file name).
      var dirs = path.substring(0, path.lastIndexOf("/") + 1);  // The path without the trailing portion.
      return "f[path='" + dirs + "'][name='" + name + "']";  // Create a node selector for a file.
  }
}
