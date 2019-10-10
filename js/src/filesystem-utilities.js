const FS_UNIT_TYPE = {
    FILE: 'f',
    DIR: 'd',
    LINK: 'ln'
};

const FS_ROOT_NAME = ':';

/**
 * Generic class for file system objects
 *
 * @param {String} name
 * @param {String} type From FS_UNIT_TYPE enum
 */
class FsUnit {
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

/**
 * File
 *
 * @param {String} name
 * @param {String} content
 */
class FsFile extends FsUnit {
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
     * Append to file content. Recalculate size.
     *
     * @param {String} content
     */
    append(content) {
        this._checkContent(content);
        this._content = this._content + content;
        this._setSize(this._content);
    }

    /**
     * Check is content a string
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

/**
 * Directory. Has a Map structure under the hood
 *
 * @param {String} name
 */
class FsDir extends FsUnit {
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
     * Delete an item from the directory.
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
        this.content.forEach(item => {
            overallSize += item.size
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

/**
 * File system management. Contain current user pointer.
 * Creates root directory
 * TODO: Add restore method, that will allow to recreate fs from plain object
 * TOOD: Add toPlain method
 * With such methods we could be able to store fs in user storage
 */
class FileSystem {
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
            } while (unitPosition < fsUnitPath.length && unit);
            return unit;
        } else {
            return this.root;
        }
    }
}

/**
 * Convert FsUnit object into xml format
 *
 * @param {FsUnit} fsUnit
 * @returns {String}
 */
function fsUnitToXML(fsUnit) {
    if (fsUnit.type == FS_UNIT_TYPE.FILE) {
        const filePath = fsUnit.path.slice(0, -1);
        const renderedPath = filePath.length ?
            `/${filePath.join('/')}/` :
            `/`
        return `
      <f name='${fsUnit.name}' path='${renderedPath}'>
        <contents>${fsUnit.content}</contents>
      </f>
    `;

    } else if (fsUnit.type == FS_UNIT_TYPE.DIR) {
        // Recursevly process directory element
        return `
      <d name='${fsUnit.name}' path='/${fsUnit.path.join('/')}/'>
        <c>
          ${fsUnit.content.map(it => fsUnitToXML(it)).join('\n')}
        </c>
      </d>
    `;
    }
}

/**
 * Convert whole file system into xml
 *
 * @param {FileSystem} fs
 * @returns {String}
 */
function fsToXML(fs) {
    return `
    <d name='/' path='/'>
      <c>
        ${fs.content.map(it => fsUnitToXML(it)).join('\n')}
      </c>
    </d>
  `;
}
