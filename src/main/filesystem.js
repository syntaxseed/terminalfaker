// TODO - Refactor the initial filesystem state to read from a JSON file and then do this conversion.

// Here we create initial file system structure. Changes are saved to LocalStorage.
// System is reset to this on 'reboot' command.

import { FileSystem } from './components/fs/FileSystem';
import { FsDir } from './components/fs/FsDir';
import { FsFile } from './components/fs/FsFile';

export const initialFilesystem = new FileSystem();

initialFilesystem
  .add(new FsDir('.tmp-dir'), [])

initialFilesystem
  .add(new FsFile('.hidden', 'There is a hidden file.'), []);

initialFilesystem
  .add(new FsDir('docs'), [])

initialFilesystem
  .get(['docs'])
  .add(new FsFile('moretodo.txt', 'A, B, C.'))

initialFilesystem
  .get(['docs'])
  .add(new FsFile('ok.txt', 'I am ok.'))

initialFilesystem
  .get(['docs'])
  .add(new FsFile(
    'shoplist.txt',
      `-Apples\n-Bananas\n-Cookies`
      )
    );

initialFilesystem
  .get(['docs'])
  .add(new FsDir('private'))

initialFilesystem
  .get(['docs', 'private'])
  .add(new FsFile('secret.txt', 'PxNmGkl6M+jDP4AYAKZET18SEnWD5qw5LIP9174lONWslF144K9VHFIk1JA='))

initialFilesystem
  .get(['docs', 'private'])
  .add(new FsDir('opt'))

initialFilesystem
  .get(['docs'])
  .add(new FsDir('tmp'))

initialFilesystem
  .add(new FsDir('more'), [])
  .add(new FsFile('moretodo.txt', `Don't forget this other stuff.`))

initialFilesystem
  .add(new FsDir('stuff'), [])

initialFilesystem
  .add(new FsFile('cool.txt', 'There is a hidden command in this terminal called \'secret\'.'), []);
