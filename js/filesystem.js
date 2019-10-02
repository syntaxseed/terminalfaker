const FS_UNIT_TYPE = {
  FILE: 'f',
  DIR: 'd',
  LINK: 'ln'
};

const FS_ROOT_NAME = ':';

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

  set parentDir(parentDir) {
    if (parentDir.type !== FS_UNIT_TYPE.DIR) {
      throw new Error('Parent should be FsDir!');
    }
    this._parent = parentDir;
  }

  get parentDir() {
    return this._parent;
  }

  isFile() {
    return this.type === FS_UNIT_TYPE.FILE;
  }

  isDir() {
    return this.type === FS_UNIT_TYPE.DIR;
  }
}

class FsFile extends FsUnit {
  constructor(name, content) {
    super(name, FS_UNIT_TYPE.FILE);
    this._checkContent(content);
    this._content = content;
    this._setSize(content);
    this._parent = undefined;
  }

  update(content) {
    this._checkContent(content);
    this._content = content;
    this._setSize(content);
  }

  _checkContent(content) {
    if (typeof content !== 'string') {
      throw new Error('Invalid file content');
    }
  }

  _setSize(content) {    
    if (Blob) {
      this._size = new Blob([content]).size;
    } else {
      this._size = Buffer.byteLength(content, 'utf-8');
    }
  }
}

class FsDir extends FsUnit {
  constructor(name) {
    super(name, FS_UNIT_TYPE.DIR);
    this._content = new Map();
    this._parent = this;
  }

  add(fsUnit) {
    return this.update(fsUnit);
  }

  update(fsUnit) {
    fsUnit.parentDir = this;
    
    this._content.set(fsUnit.name, fsUnit);
    return fsUnit;
  }

  remove(fsUnit) {
    this._content.delete(fsUnit.name);
    return true;
  }

  get content() {
    const dirContent = [];
    for (const [key] of this._content) {
      dirContent.push(this._content.get(key));    
    }  
    return dirContent;
  }

  get size() {
    let overallSize = 0;
    this.content.forEach(it => {
      overallSize += it.size
    });
    return overallSize;
  }

  /**
   * 
   * @param {String} name
   */
  get(name) {
    return this._content.get(name);
  }
}


class FileSystem {
  constructor() {
    this.root = new FsDir(FS_ROOT_NAME);
    this.pointer = this.root;
  }

  /**
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

  get content() {
    return this.root.content;
  }

  get size() {
    return this.root.size;
  }

  /**
   * 
   * @param {FsUnit} fsUnit 
   * @param {String[]} fsUnitPath  Full path to fsUnit
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
   * 
   * @param {String[]} fsUnitPath 
   * @returns FsUnit
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

var myFs = new FileSystem();

myFs
  .add(new FsDir('.tmp-dir'), [])

myFs
  .add(new FsFile('.hidden', 'There is a hidden file.'), []);

myFs
  .add(new FsDir('docs'), [])

myFs
  .get(['docs'])
  .add(new FsFile('moretodo.txt', 'A, B, C.'))

myFs
  .get(['docs'])
  .add(new FsFile('ok.txt', 'I am ok.'))

myFs
  .get(['docs'])
  .add(new FsFile(
    'shoplist.txt', 
      `-Apples\n-Bananas\n-Cookies`
      )
    );

myFs
  .get(['docs'])
  .add(new FsDir('private'))

myFs
  .get(['docs', 'private'])
  .add(new FsFile('secret.txt', 'PxNmGkl6M+jDP4AYAKZET18SEnWD5qw5LIP9174lONWslF144K9VHFIk1JA='))

myFs
  .get(['docs', 'private'])
  .add(new FsDir('opt'))

myFs
  .get(['docs'])
  .add(new FsDir('tmp'))

myFs
  .add(new FsDir('more'), [])
  .add(new FsFile('moretodo.txt', `Don't forget this other stuff.`))

myFs
  .add(new FsDir('stuff'), [])

myFs
  .add(new FsFile('cool.txt', 'There is a hidden command in this terminal called \'secret\'.'), []);


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
    return `
      <d name='${fsUnit.name}' path='/${fsUnit.path.join('/')}/'>
        <c>
          ${fsUnit.content.map(it => fsUnitToXML(it)).join('\n')}
        </c>
      </d>
    `;
  }
}


function fsToXML(fs) {
  return `
    <d name='/' path='/'>
      <c>
        ${fs.content.map(it => fsUnitToXML(it)).join('\n')}
      </c>
    </d>
  `
}

var originalFilesystem = fsToXML(myFs);
