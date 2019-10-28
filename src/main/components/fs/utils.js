import { FS_UNIT_TYPE } from './FsUnit';

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
export function fsToXML(fs) {
  return `
    <d name='/' path='/'>
      <c>
        ${fs.content.map(it => fsUnitToXML(it)).join('\n')}
      </c>
    </d>
  `
}
