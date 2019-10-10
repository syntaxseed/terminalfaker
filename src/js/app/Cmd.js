import { FS_UNIT_TYPE, FS_ROOT_NAME } from '../components/fs/FsUnit';
import { FsFile } from '../components/fs/FsFile';
import { CmdHelper } from '../components/CmdHelper';
import { PathHelper } from '../components/path/PathHelper';
import { CmdValidationError } from '../components/errors/CmdValidationError';
import { Tea } from '../components/crypto';
import { getAllMethodNames } from '../components/utils';
import { Terminal } from './Terminal';
import { version } from '../version';

export class TerminalCommands {
  /**
   * Built-in System Commands
   * Modelled after Linux Bash commands.
   * 
   * @param {Terminal} terminal 
   */
  constructor(terminal) {
    this.terminal = terminal;
  }

  get cat() {
    return {
      about: "cat [file]<br>&nbsp;&nbsp;Display the contents of the specified file.",
      exe: (args) => {
        if(args.length != 2){
            throw new CmdValidationError('cat', "No such file.");
        }
        const { listingUnit, path } = this.terminal.getFsUnit(args);

        if (!listingUnit || (listingUnit && !listingUnit.isFile())) {
            throw new CmdValidationError('cat', `${path}: No such file, or argument is a directory.`);
        }
        const content = listingUnit.content || '';
        return content.replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + '<br>' + '$2');
      }
    };
  }

  /**
   * Change into a directory.
   **/
  get cd() {
    return {
      about: "cd [path]<br>&nbsp;&nbsp;Change directory to the specified path.",
      exe: (args) => {
          if(args.length != 2){
              return "";
          }
          var result = this.terminal.changeDirectory(args[1]);
          if(!result){
              return "No such directory.";
          }
          return "";
      }
    };
  }

  /**
   * Clears the terminal using a special flag on the resetPrompt function.
   **/
  get clear() {
    return {
      about: "clear<br>&nbsp;&nbsp;Clear the terminal window.",
      exe: () => {
          return "";    // Functionality is handled internally by watching for this specific command name when resetting the prompt.
      }
    }

  }

  /**
   * Echos text to the terminal
   **/
  get echo() {
    return {
      about: "echo [string]<br>&nbsp;&nbsp;Display a line of text.",
      exe: function(args) {
        var result = args.slice();
        result.shift();
        return result.join(" ");
      }
    };
  }

  /**
   * Encryption commands which use a password a string.
   **/
  get encrypt() {
    return {
      about:  "encrypt [message] [password]<br>&nbsp;&nbsp;Encrypt a provided message using the password.",
      exe: (args) => {
        if(args.length != 3){
            return "encrypt: Invalid number of arguments.";
        }
        var result = Tea.encrypt(args[1], args[2]);
        return result;
      }
    };
  }

  get decrypt() {
    return {
      about:  "decrypt [encoded] [password]<br>&nbsp;&nbsp;Decrypt a provided message using the password.",
      exe: (args) => {
        if(args.length != 3){
            return "decrypt: Invalid number of arguments.";
        }
        var result = Tea.decrypt(args[1], args[2]);
        return result;
      }
    };
  }

  /**
   * Lists all available commands or the help for a given command.
   **/
  get help() {
    return {
      about: "help [command]<br>&nbsp;&nbsp;Show a list of available commands, or help for a specific command.",
      exe: (args) => {
        var output = "";      
        if (args.length == 2 && args[1] && args[1].toLowerCase() in this) {          
          output += "<strong>" + args[1].toLowerCase() + "</strong>: " + this[args[1].toLowerCase()].about + "";
        } else {
          output += "TERMFAKE bash, version " + version + "-release (x86_64-pc-linux-gnu)<br>These shell commands are defined internally.  Type 'help' to see this list.<br>Type 'help name' to find out more about the function 'name'.<br><br>";
          output += "";
  
          getAllMethodNames(this).sort().forEach((cName) => {
            if(this[cName].about && !this[cName].hidden) {
              output += "<strong>" + cName + "</strong>&nbsp; ";
            }
          });
        }
        output += "<br><br>";
        return output;
      }
    };
  }

  /**
   * Lists the recent builtInCommands.
   **/
  get history() {
    return {
      about: "history [-OPTIONS]<br>&nbsp;&nbsp;Display the list of recent commands.<br>&nbsp;&nbsp;-c clear the history list.",
      exe: (args) => {
        if (args.length == 2 && args[1] == "-c") {
          localStorage.setItem("history", []);
          this.terminal.history = [];
        }
        var history = this.terminal.history;
        var output = "";

        history.forEach(function (element, index) {
          output += index + "&nbsp;&nbsp;" + element + "<br>";
        });
        return output;
      }
    };
  }

  /**
   * Lists the files and directories in the current path.
   **/
  get ls() {
    return {
      about: "ls [-OPTIONS]<br>&nbsp;&nbsp;List directory contents.<br>&nbsp;&nbsp;-l use a long listing format.<br>&nbsp;&nbsp;-a do not ignore entries starting with a period (.).",
      exe: (args) => {        
        // TOOD: Add to constant
        const supportedFlagsList = ['a', 'l'];
        const { listingUnit, path } = this.terminal.getFsUnit(args);
        if (!listingUnit) {
          throw new CmdValidationError('ls', `${path}: No such file or directory`);
        }
        const flagList = CmdHelper.parseFlags(args, supportedFlagsList)
  
        switch (listingUnit.type) {
          case FS_UNIT_TYPE.FILE:
            return flagList.has('l') ?
              [CmdHelper.lsRenderFullLine(listingUnit)].join('<br>') :
              [CmdHelper.lsRenderOneLine(listingUnit)].join('<br>');
          case FS_UNIT_TYPE.DIR:
            const dirContent = flagList.has('a') ?
              listingUnit.content :
              listingUnit.content.filter(it => it.name[0] !== '.');
  
            return flagList.has('l') ?
              dirContent.map(fsUnit => CmdHelper.lsRenderFullLine(fsUnit)).join('<br>') :
              dirContent.map(fsUnit => CmdHelper.lsRenderOneLine(fsUnit)).join('&nbsp;&nbsp;');
          default:
                return ''
        }
      }
    };
  }

  /**
   * Print the name of the current/working directory.
   */
  get pwd() {
    return {
      about: "pwd<br>&nbsp;&nbsp;Print the name of the current working directory.",
      exe: () => {
          return this.terminal.fs.pwd();
      }
    };
  }

  /**
   * Reset the local storage data for this app.
   **/
  get reboot() {
    return {
      about: "reboot<br>&nbsp;&nbsp;Reboot the terminal and reset saved environment.",
      exe: () => {
        localStorage.removeItem("filesystem");
        localStorage.removeItem("history");
        this.terminal.initSession();
        setTimeout(function() {
            // Delay terminal boot to wait for initializing session to complete.
            this.terminal.bootTerminalStart(document.getElementById("terminal"));
        }, 5);
        return "";
      }
    };
  }

  /**
   * Delete a file with the given name.
   * TODO: Check if error messages are rigth
   **/
  get rm() {
    return {
      about: "rm [name]<br>&nbsp;&nbsp;Delete the file with the specified name in the current directory.",
      exe: (args) => {
        if(args.length == 1){
          throw new CmdValidationError('rm', "No filename specified.");
        }
        if(args.length > 2){
          throw new CmdValidationError('rm', "Too many parameters supplied.");
        }
        const { listingUnit, path } = this.terminal.getFsUnit(args);
        if (!listingUnit) {
            throw new CmdValidationError('rm', `${path}: No such file, or directory.`);
        }
        const preparedPath = path.split('/').filter(it => it.length);
        const targetUnit = this.terminal.fs.get(preparedPath);

        // TODO: Add flag support here
        if (targetUnit.name === FS_ROOT_NAME) {
            throw new CmdValidationError('rm', `${path}: Unable to remove root catalogue`);
        }
        if (targetUnit.isDir()) {
            throw new CmdValidationError('rm', `${path}: Unable to remove directory.`);
        }

        targetUnit
          .parentDir
          .remove(targetUnit)

        return "";
      }
    };
  }

  /**
   * Create an empty file with the given name.
   **/
  get touch() {
    return {
      about: "touch [name]<br>&nbsp;&nbsp;Create a file with the specified name in the current directory.",
      exe: (args) => {  
        if(args.length == 1){
          throw new CmdValidationError('touch', "No filename specified.");
        }

        if(args.length > 2){
          throw new CmdValidationError('touch', "Too many parameters supplied.");
        }

        const { listingUnit, path } = this.terminal.getFsUnit(args);
        
        const preparedPath = this.terminal.createFullPath(path);
        const newFileName = preparedPath.pop();
                
        if (!PathHelper.isValidFilename(newFileName)) {
          throw new CmdValidationError('touch', `${path}: Invalid file name.`);
        }
        if (listingUnit && listingUnit.isDir()) {
          throw new CmdValidationError('touch', `${path}: Unable to create directory.`);
        }
        if (listingUnit && listingUnit.isFile()) {
          throw new CmdValidationError('touch', `${path}: File already exists.`);
        }
        
        this.terminal.fs
          .get(preparedPath)
          .add(new FsFile(newFileName, ""));

        return "";
      }
    };
  }

  /**
   * Get the version, author and repo information for Terminal Faker.
   */
  get version() {
    return {
      about: "version<br>&nbsp;&nbsp;Display the version and attribution of this terminal application.",
      exe: () => {
        return "Terminal Faker: version " + this.terminal.version + " (https://github.com/syntaxseed/terminalfaker) by Sherri Wheeler.";
      }
    };
  }

}
