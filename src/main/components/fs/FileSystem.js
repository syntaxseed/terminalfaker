import { FS_ROOT_NAME, FS_UNIT_TYPE } from './FsUnit';
import { FsDir } from './FsDir';

/**
 * File system management. Contain current user pointer.
 * Creates root directory
 * TODO: Add restore method, that will allow to recreate fs from plain object
 * TOOD: Add toPlain method
 * With such methods we could be able to store fs in user storage
 */
export class FileSystem {
  constructor() {
    this.root = new FsDir(FS_ROOT_NAME);
    this.pointer = this.root;
  }

  /**
   * Change pointer to passed directory
   * TODO: Fix exception throwing
   *
   * @param {String[]} pathTo
   */
  cd(pathTo) {
    const unit = this.get(pathTo);
    if (!unit) {
      throw new Error('Invalid path');
    }
    if (unit.type != FS_UNIT_TYPE.DIR) {
      throw new Error(`${pathTo} is not a directory`);
    }
    this.pointer = unit;
  }

  /**
   * Get formatted path according to pointer
   *
   * @returns {String}
   */
  pwd() {
    let current = this.pointer;

    if (current === this.root) {
      return '/';
    } else {
      const path = [];
      do {
        path.push(current.name)
        current = current.parentDir;
      } while (current !== this.root);
      return `/${path.reverse().join('/')}`;
    }
  }

  /**
   * Get root dir content
   *
   * @returns {FsUnit[]}
   */
  get content() {
    return this.root.content;
  }

  /**
   * Get byte size of root dir
   *
   * @returns {Number}
   */
  get size() {
    return this.root.size;
  }

  /**
   * Create new dir or file in passed location.
   * Check if location exists
   * TODO: Fix exceptions
   *
   * @param {FsUnit} fsUnit
   * @param {String[]} fsUnitPath  Full path to fsUnit. Should not contain new unit name
   * @returns {FsUnit}
   */
  add(fsUnit, fsUnitPath) {
    if (fsUnitPath.length > 1) {
      if (fsUnit.name !== fsUnitPath[fsUnitPath - 1]) {
        throw new Error('Last element of path should contain fs unit name');
      }
      const parentUnit = this.get(fsUnitPath.slice(0, -1));
      if (!parentUnit) {
        throw new Error('Unit not exists');
      }
      if (parentUnit.type !== FS_UNIT_TYPE.DIR) {
        throw new Error('Should be directory');
      }
      fsUnit.parentDir = parentUnit;
      parentUnit.update(fsUnit);
    } else {
      fsUnit.parentDir = this.root;
      this.root.update(fsUnit);
    }
    return fsUnit;
  }

  // TODO: implement removal method
  remove(fsUnit) {
    if (fsUnitPath.length > 1) {

    } else {
      fsUnit.parentDir = this.root;
      this.root.remove(fsUnit);
    }
  }

  /**
   * Get file or dir by full path
   *
   * @param {String[]} fsUnitPath
   * @returns {FsUnit|undefined}
   */
  get(fsUnitPath) {
    if (fsUnitPath.length >= 1) {
      let unit = undefined;
      let unitPosition = 0;
      do {
        if (unitPosition == 0) {
          unit = this.root.get(fsUnitPath[unitPosition]);
        } else if (unit.type == FS_UNIT_TYPE.DIR) {
          unit = unit.get(fsUnitPath[unitPosition]);
        }
        unitPosition++;
      } while(unitPosition < fsUnitPath.length && unit);
      return unit;
    } else {
      return this.root;
    }
  }
}