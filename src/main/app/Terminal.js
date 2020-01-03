import { version } from '../version';
import { PathHelper } from '../components/path/PathHelper';
import { InputHelper } from '../components/InputHelper';
import { FileSystem } from '../components/fs/FileSystem';
import { KEY_CODE_MAP } from '../components/keysMap';
import { fsToXML } from '../components/fs/utils';

/**
 * TerminalFaker
 * A JavaScript Bash terminal simulation.
 */
export class Terminal {
  // public version: string;
  // private path: string;
  // private domFileSystem;
  // private domFileSystemPointer
  // private customPrompt;
  // private commands;
  // private fs: FileSystem;
  // private history;
  // private historyIndex: number;
  // private MAX_HISTORY: number;
  // private options: { useBootLoader?: boolean; bootMessageLines?: string[]; }

  constructor(options) {
    this.commands = undefined;
    this.fs = new FileSystem();
    this.history = [];
    this.historyIndex = 0;
    this.MAX_HISTORY = 20;
    this.version = version;
    this.options = options;
  }

    /**
   * Function parsing path for commands like: cmd [flags] [path]
   * Parse absolute and relative paths. If relative - takes current dir
   * and resolves with '..' notation
   *
   * @param {String[]} args Args in format ['cmd', 'flag1', 'flag2', 'path']
   * @returns {Object} root
   * @returns {FsUnit} [root.listingUnit] Dir or File
   * @returns {String} root.path
   */
  getFsUnit(args) {
    let listingUnit = this.fs.pointer;
    const path = args.slice(1).filter(it => it.indexOf('-') !== 0)[0] || '.';
    if (args.length > 1) {
        if (path !== '.') {
            const preparedPath = this.createFullPath(path);
            listingUnit = this.fs.get(preparedPath);
            if (!listingUnit) {
                return {
                    path
                };
            }
        }
    }
    return {
        listingUnit,
        path
    };
  }

  /**
   * Create absolute path from passed param. Param could be
   * relative or absolute path
   *
   * @param {String} path Path to filesistem unit in unix format
   * @returns {String[]}
   */
  createFullPath(pathToUnit) {
    const startDir = pathToUnit.indexOf('/') === 0 ?
      '/' :
      this.fs.pwd();
    return PathHelper.resolveToArray(startDir, pathToUnit);
  }

     // Auxiliary functions

  resetPrompt(terminal, prompt, clear) {
    var newPrompt = prompt.parentNode.cloneNode(true);

    // Make sure all other prompts are no longer editable:
    var promptsAll = document.querySelectorAll("[contenteditable=true]");
    for (var i = 0; i < promptsAll.length; i++) {
        promptsAll[i].setAttribute("contenteditable", false);
    }

    // ??????
    // if (this.prompt) {
    //     newPrompt.querySelector(".prompt").textContent = this.prompt;
    // }
    if ((typeof clear !== 'undefined') && clear) {
        while (terminal.firstChild) terminal.removeChild(terminal.firstChild);
    }
    terminal.appendChild(newPrompt);
    newPrompt.querySelector(".prompt").innerHTML = this.customPrompt();
    newPrompt.querySelector(".input").innerHTML = " ";
    newPrompt.querySelector(".input").focus();
  }

  runCommand(cmd, args) {
    let cmdRunResult = '';
    try {
      cmdRunResult = this.commands[cmd].exe(args);
    } catch (error) {
      if (error.type === 'CmdValidationError') {
        cmdRunResult = error.message;
      }
    }
    return cmdRunResult;
  }

  /**
   * Expect an array of arrays
   * Send command array one at a time via .reduce to the commandRunner
   * Accumulates the 'stdout' and appends to the next command array as final argument
   *
   * @param domElement
   * @param {String[][]} preparedInput
   */
  dispatchToCommandRunner(domElement, preparedInput) {
    const stdout = preparedInput.reduce((accumulator, current) => {
      const output = current.concat(accumulator);
      return this.commandRunner(domElement, output);
    }, []);
    return stdout;
  };

  commandRunner(domElement, commandArray) {
    if (commandArray[0].toLowerCase() in this.commands) {
      return this.runCommand(commandArray[0].toLowerCase(), commandArray);
    } else {
      // TODO: Move this to display method
      domElement.innerHTML += commandArray[0] + ": command not found";
    }
  }

  displayStdout(terminal, cmdRunResult) {
    if (cmdRunResult) {
      terminal.innerHTML += `<div>${cmdRunResult}</div>`;
    }
  }

  updateHistory(cmd) {
    if (this.history.length >= this.MAX_HISTORY) {
        this.history.shift();
    }
    this.history.push(cmd);
    localStorage.setItem("history", this.history);
    this.historyIndex = this.history.length;
  }

  browseHistory(prompt, direction) {
    var changedPrompt = false;
    if (direction == KEY_CODE_MAP.KEY_UP && this.historyIndex > 0) {
        prompt.textContent = this.history[--this.historyIndex];
        changedPrompt = true;
    } else if (direction == KEY_CODE_MAP.KEY_DOWN) {
        if (this.historyIndex < this.history.length)++this.historyIndex;
        if (this.historyIndex < this.history.length) prompt.textContent = this.history[this.historyIndex];
        else prompt.textContent = " ";
        changedPrompt = true;
    }

    if (changedPrompt) {
        try {
            var range = document.createRange();
            var sel = window.getSelection();
            range.setStart(prompt.childNodes[0], prompt.textContent.length);
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range);
        } catch (err) { }
    }
  }

  autoCompleteInput(input) {
    const inputArray = input.split(" ")
    if (inputArray.length > 1) {
      return this.autoCompleteFiles(inputArray)
    } else if (inputArray.length == 1) {
      return this.autoCompleteCommands(input.replace(/\s+/g, ""))
    } else {
      return [];
    }
  }

  autoCompleteCommands(input) {
    const suggestions = [];
    const customCommands = this.commands

    const re = new RegExp("^" + input, "ig")
    for (let command in customCommands) {
      if(customCommands.hasOwnProperty(command) && command.match(re)) {
        suggestions.push(command);
      }
    }

    const prototype = Object.getPrototypeOf(this.commands)
    const prototypeCommands = Object.getOwnPropertyNames(prototype)
    
    for(let command of prototypeCommands){
      if(prototype.hasOwnProperty(command) && command.match(re)){
        suggestions.push(command);
      }
    }
    return suggestions;
  }

  autoCompleteFiles(inputArray) {
    const suggestions = [];
    const { listingUnit } = this.getFsUnit(["ls"])
    const names = listingUnit.content.map((element) => {
      return element.name
    })
    const re = new RegExp("^" + inputArray[inputArray.length - 1], "ig")
    for (let name of names) {
      if (name.match(re)) {
        suggestions.push([inputArray[0], name].join(" "))
      }
    }
    return suggestions;
  }

  saveFilesystem() {
    var strFilesystem;
    if (typeof (XMLSerializer) !== 'undefined') {
        strFilesystem = (new XMLSerializer()).serializeToString(this.domFileSystem);
    } else if ('outerHTML' in this.domFileSystem) {
        strFilesystem = this.domFileSystem.outerHTML;
    } else {
        strFilesystem = fsToXML(this.fs); // TODO: Saving doesn't work.
    }
    localStorage.setItem("filesystem", strFilesystem);
  }

  bootTerminalStart(terminal) {
    var defaultLine = "Type 'help' to get started.";
    let bootMessage = this.options.bootMessageLines;
    if (!this.options.bootMessageLines || !this.options.bootMessageLines.length) {
      bootMessage = [defaultLine];
    }

    if (!this.options.useBootLoader) {
      bootMessage = [defaultLine];
    }

    var boot = document.getElementById("boot");
    if (boot == null) {
        var bootElement = document.createElement('p');
        bootElement.setAttribute('id', 'boot');
        terminal.insertBefore(bootElement, terminal.firstChild);
    }
    boot = document.getElementById("boot");
    this.bootTerminalMessage(terminal, boot, bootMessage, 0);
  }

  bootTerminalMessage(terminal, bootElement, introLines, num) {
    if (num == 0) {
        // First hide the prompt and clear any defaul message:
        terminal.querySelector(".hidden").style.display = 'none';
        bootElement.innerHTML = "";
    }
    bootElement.innerHTML += introLines[num];
    if (num + 1 in introLines) {
        // If we have more lines, add the next afer a delay.
        setTimeout(() => {
            this.bootTerminalMessage(terminal, bootElement, introLines, num + 1);
        }, 500);
    } else {
        terminal.querySelector(".hidden").style.display = ''; // Show the prompt.
        terminal.querySelector(".input").focus();
    }
  }

  changeDirectory(path) {
    if (path === '.') {
      return true;
    }
    try {
      const startDir = path.indexOf('/') === 0 ?
        '/' :
        this.fs.pwd();
      const preparedPath = PathHelper.resolveToArray(startDir, path);

      this.fs.cd(preparedPath);
    } catch {
        return false;
    }
    this.path = this.fs.pwd();
    return true;
  }

  init(elem, commands, customPrompt, initialFilesystem) {
    this.commands = commands;
    this.customPrompt = customPrompt;
    this.fs = initialFilesystem;

    this.initSession();

    elem.addEventListener("keydown", (event) => {
      if (event.keyCode == KEY_CODE_MAP.KEY_TAB) {
        var prompt = event.target;
        var suggestions = this.autoCompleteInput(prompt.textContent);

        if (suggestions.length == 1) {
          prompt.textContent = suggestions[0];
          var range = document.createRange();
          var sel = window.getSelection();
          range.setStart(prompt.childNodes[0], suggestions[0].length);
          range.collapse(true);
          sel.removeAllRanges();
          sel.addRange(range);
        }

        event.preventDefault(true);
        return false;
      }
    });

    elem.addEventListener("keyup", (event) => {
      if (this.historyIndex < 0) return;
      this.browseHistory(event.target, event.keyCode);
    });

    elem.addEventListener("keypress", (event) => {
      const prompt = event.target;
      if (event.keyCode != KEY_CODE_MAP.KEY_ENTER) return false;

      const enteredComand = prompt.textContent.trim();

      // Split entered command by spaces, but not spaces in quotes.
      const input = enteredComand.match(/(?=\S)[^"\s]*(?:"[^\\"]*(?:\\[\s\S][^\\"]*)*"[^"\s]*)*/g);

      if (input == null) {
        this.resetPrompt(elem, prompt, false);
        event.preventDefault();
        return;
      }

      // Execute the sanitization, dispatching, and display
      this.updateHistory(enteredComand);
      const sanitized = InputHelper.sanitize(input);
      const commandOutput = this.dispatchToCommandRunner(elem, sanitized);
      this.displayStdout(elem, commandOutput);

      // Reset the prompt, and the given array of command also clear the screen.
      this.resetPrompt(elem, prompt, (['clear', 'reboot'].indexOf(input[0].toLowerCase()) >= 0));
      event.preventDefault();
    });

    elem.querySelector(".prompt").innerHTML = this.customPrompt();
    elem.querySelector(".input").focus();

    // this.term = elem;

    // Run the custom boot loader, unless disabled.
    this.bootTerminalStart(document.getElementById("terminal"));

    return this;
  }

  initSession() {
    this.history = (localStorage.getItem("history") ? localStorage.getItem("history").split(",") : []);
    this.historyIndex = this.history.length;

    var fileSystemStr = (localStorage.getItem("filesystem") ? localStorage.getItem("filesystem") : fsToXML(this.fs));

    this.domFileSystem = (new DOMParser).parseFromString(fileSystemStr, "text/xml");

    this.path = "/";
    this.domFileSystemPointer = this.domFileSystem.querySelector('d');
}

}