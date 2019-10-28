import { FsUnit, FS_UNIT_TYPE } from './FsUnit';

/**
 * Directory. Has a Map structure under the hood
 *
 * @param {String} name
 */
export class FsDir extends FsUnit {
  constructor(name) {
    super(name, FS_UNIT_TYPE.DIR);
    this._content = new Map();
    this._parent = this;
  }

  /**
   * Add file or dir into directory
   *
   * @param {FsUnit} fsUnit
   */
  add(fsUnit) {    
    return this.update(fsUnit);
  }

  /**
   * Add file or dir into directory
   *
   * @param {FsUnit} fsUnit
   * @returns {FsUnit}
   */
  update(fsUnit) {
    fsUnit.parentDir = this;

    this._content.set(fsUnit.name, fsUnit);
    return fsUnit;
  }

  /**
   * Delete directory content
   *
   * @param {FsUnit} fsUnit
   * @returns {Boolean}
   */
  remove(fsUnit) {
    this._content.delete(fsUnit.name);
    return true;
  }

  /**
   * Get directory content as list
   *
   * @returns {FsUnit[]}
   */
  get content() {
    const dirContent = [];
    for (const [key] of this._content) {
      dirContent.push(this._content.get(key));
    }
    return dirContent;
  }

  /**
   * Get directory byte size.
   * Calculate overallsize of every element of dir
   *
   * @returns {Number}
   */
  get size() {
    let overallSize = 0;
    this.content.forEach(it => {
      overallSize += it.size
    });
    return overallSize;
  }

  /**
   * Get directory element by name
   *
   * @param {String} name Name of file or dir
   * @returns {FsUnit|undefined}
   */
  get(name) {
    return this._content.get(name);
  }
}
