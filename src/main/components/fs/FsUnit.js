export const FS_UNIT_TYPE = {
  FILE: 'f',
  DIR: 'd',
  LINK: 'ln'
};


export const FS_ROOT_NAME = ':';

/**
 * Generic class for file system objects
 *
 * @param {String} name
 * @param {String} type From FS_UNIT_TYPE enum
 */
export class FsUnit {
  constructor(name, type) {
    this.name = name;
    this.type = type;
    this.access = '';
    this.lastMod = Date.now()
    this._content = {};
    this._size = 0;
  }

  get content() {
    return this._content;
  }

  /**
   * Content size in bytes
   *
   * @returns {Number}
   */
  get size() {
    return this._size;
  }

  /**
   * @returns {String[]}
   */
  get path() {
    let current = this;
    const path = [];
    if (current.name !== FS_ROOT_NAME) {
      do {
        path.push(current.name);
        current = current.parentDir;
      } while (current.name !== FS_ROOT_NAME);
    }
    return path.reverse();
  }

  /**
   * Set link to parent FsUnit Object
   *
   * @param {FsUnit} parentDir
   */
  set parentDir(parentDir) {
    if (parentDir.type !== FS_UNIT_TYPE.DIR) {
      throw new Error('Parent should be FsDir!');
    }
    this._parent = parentDir;
  }

  /**
   * Link to parent FsUnit Object
   *
   * @returns {FsUnit} parentDir
   */
  get parentDir() {
    return this._parent;
  }

  /**
   * @returns {Boolean}
   */
  isFile() {
    return this.type === FS_UNIT_TYPE.FILE;
  }

  /**
   * @returns {Boolean}
   */
  isDir() {
    return this.type === FS_UNIT_TYPE.DIR;
  }
}