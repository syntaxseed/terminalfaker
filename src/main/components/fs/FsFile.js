import { FsUnit, FS_UNIT_TYPE } from './FsUnit';

/**
 * File
 *
 * @param {String} name
 * @param {String} content
 */
export class FsFile extends FsUnit {
  constructor(name, content) {
    super(name, FS_UNIT_TYPE.FILE);
    this._checkContent(content);
    this._content = content;
    this._setSize(content);
    this._parent = undefined;
  }

  /**
   * Set file content. recalculate size
   *
   * @param {String} content
   */
  update(content) {
    this._checkContent(content);
    this._content = content;
    this._setSize(content);
  }

  /**
   * Check is content is string
   *
   * @param {String} content
   */
  _checkContent(content) {
    if (typeof content !== 'string') {
      throw new Error('Invalid file content');
    }
  }

  /**
   * Set content byte size
   *
   * @param {String} content
   */
  _setSize(content) {
    if (Blob) {
      this._size = new Blob([content]).size;
    } else {
      this._size = Buffer.byteLength(content, 'utf-8');
    }
  }
}