var builtInCommands = {};

class CmdValidationError extends Error {
    /**
     * 
     * @param {String} cmd Command name 
     * @param {String} msg Error msg
     */
    constructor(cmd, msg) {
        super(`${cmd}: ${msg}`);
        this.type = 'CmdValidationError';
    }
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
function getFsUnit(args) {
    let listingUnit = term.tmp_fs.pointer;
    const path = args.slice(1).filter(it => it.indexOf('-') !== 0)[0] || '.'; 
    if (args.length > 1) {
        if (path !== '.') {
            const startDir = path.indexOf('/') === 0 ? 
                '/' : 
                term.tmp_fs.pwd();
            const preparedPath = term.pathMgr.resolveToArray(startDir, path);
            listingUnit = term.tmp_fs.get(preparedPath);
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
 * Take every element from arg array with dash '-',
 * remove duplicates and invalid flags
 * 
 * @param {String[]} args In format ['ls', '-la', '/'] 
 * @param {String[]} supportedFlagsList Such as ['a', 'l]
 * @returns {Set}
 */
function parseFlags(args, supportedFlagsList) {
    return new Set(
        args
        .filter(option => option.indexOf('-') === 0)
        .map(option => option.replace('-', ''))
        .join('')
        .split('')
        .filter(option => supportedFlagsList.includes(option))
    );
}


/**
 * Format date to DD MMM HH:mm
 * 
 * @param {Date} date Js Date type
 * @returns {String}
 */
function formatDate(date) {
    const [
        _weekDay,
        day,
        mon,
        _year,
        time
    ] = date.toUTCString().split(' ');
    return [day, mon, time.split(':').slice(0, -1).join(':')].join(' ');
}

/**
 * Render for ls -l flag
 * 
 * @param {FsUnit} fsUnit File, Dir or Link
 * @returns {String}
 */
function lsRenderFullLine(fsUnit) {
    const unitType = fsUnit.isFile() ? '-' : 'd';
    return `<span>${unitType}rw-r--r--</span>&nbsp;&nbsp;` +
        `<span>11</span>&nbsp;&nbsp;` +
        `<span>guest</span>&nbsp;&nbsp;` +
        `<span>guest</span>&nbsp;&nbsp;` +
        `<span>${fsUnit.size}</span>&nbsp;&nbsp;` +
        `<span>${formatDate(new Date(fsUnit.lastMod))}</span>&nbsp;&nbsp;` +
        `<span class='filesystem-${fsUnit.type}'>${fsUnit.name}</span>`;
}

/**
 * Render for default ls
 * 
 * @param {FsUnit} fsUnit File, Dir or Link
 * @returns {String}
 */
function lsRenderOneLine(fsUnit) {
    return `<span class='filesystem-${fsUnit.type}'>${fsUnit.name}</span>`;
}


builtInCommands.cat = {
    about: "cat [file]<br>&nbsp;&nbsp;Display the contents of the specified file.",
    exe: function (args) {

        if(args.length != 2){
            throw new CmdValidationError('cat', "No such file.");
        }
        const { listingUnit, path } = getFsUnit(args);

        if (!listingUnit || (listingUnit && !listingUnit.isFile())) {
            throw new CmdValidationError('cat', `${path}: No such file, or argument is a directory.`);
        }
        const content = listingUnit.content || '';
        return content.replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + '<br>' + '$2');
    }
}

/**
 * Change into a directory.
 **/
builtInCommands.cd = {
    about: "cd [path]<br>&nbsp;&nbsp;Change directory to the specified path.",
    exe: function (args) {
        if(args.length != 2){
            return "";
        }
        var result = term.changeDirectory(args[1]);
        if(!result){
            return "No such directory.";
        }
        return "";
    }
}

/**
 * Clears the terminal using a special flag on the resetPrompt function.
 **/
builtInCommands.clear = {
    about: "clear<br>&nbsp;&nbsp;Clear the terminal window.",
    exe: function () {
        return "";    // Functionality is handled internally by watching for this specific command name when resetting the prompt.
    }
};

/**
 * Echos text to the terminal
 **/
builtInCommands.echo = {
    about: "echo [string]<br>&nbsp;&nbsp;Display a line of text.",
    exe: function(args) {
        var result = args.slice();
        result.shift();
        return result.join(" ");
   }
};

/**
 * Encryption commands which use a password a string.
 **/
builtInCommands.encrypt = {
    about:  "encrypt [message] [password]<br>&nbsp;&nbsp;Encrypt a provided message using the password.",
    exe:  function(args) {
            if(args.length != 3){
                return "encrypt: Invalid number of arguments.";
            }
            var result = Tea.encrypt(args[1], args[2]);
            return result;
    }
};
builtInCommands.decrypt = {
    about:  "decrypt [encoded] [password]<br>&nbsp;&nbsp;Decrypt a provided message using the password.",
    exe:  function(args) {
            if(args.length != 3){
                return "decrypt: Invalid number of arguments.";
            }
            var result = Tea.decrypt(args[1], args[2]);
            return result;
    }
};


/**
 * Lists all available commands or the help for a given command.
 **/
builtInCommands.help = {
    about: "help [command]<br>&nbsp;&nbsp;Show a list of available commands, or help for a specific command.",
    exe: function (args) {
        var output = "";
        if (args.length == 2 && args[1] && args[1].toLowerCase() in commands) {
            output += "<strong>" + args[1].toLowerCase() + "</strong>: " + commands[args[1].toLowerCase()].about + "";
        } else {
            output += "TERMFAKE bash, version " + version + "-release (x86_64-pc-linux-gnu)<br>These shell commands are defined internally.  Type 'help' to see this list.<br>Type 'help name' to find out more about the function 'name'.<br><br>";
            output += "";

            Object.keys(commands).sort().forEach(function (cName) {
                if( !commands[cName].hidden ){
                    output += "<strong>" + cName + "</strong>&nbsp; ";
                }
            });
        }
        output += "<br><br>";
        return output;
    }
};

/**
 * Lists the recent builtInCommands.
 **/
builtInCommands.history = {
    about: "history [-c]<br>&nbsp;&nbsp;Display the list of recent commands.<br>&nbsp;&nbsp;-c clear the history list.",
    exe: function (args) {
        if (args.length == 2 && args[1] == "-c") {
            localStorage.setItem("history", []);
            term.history = [];

        }
        var history = term.history;
        var output = "";

        history.forEach(function (element, index) {
            output += index + "&nbsp;&nbsp;" + element + "<br>";
        });
        return output;
    }
};

/**
 * Lists the files and directories in the current path.
 **/
builtInCommands.ls = {
    about: "ls [-l]<br>&nbsp;&nbsp;List directory contents.<br>&nbsp;&nbsp;-l list contents vertically.",
    exe: (args) => {
        // TOOD: Add to constant
        const supportedFlagsList = ['a', 'l'];
        const { listingUnit, path } = getFsUnit(args);
        if (!listingUnit) {
            throw new CmdValidationError('ls', `${path}: No such file or directory`);
        }
        const flagList = parseFlags(args, supportedFlagsList)

        switch (listingUnit.type) {
            case FS_UNIT_TYPE.FILE:
                return flagList.has('l') ? 
                    [lsRenderFullLine(listingUnit)].join('<br>') :
                    [lsRenderOneLine(listingUnit)].join('<br>');
            case FS_UNIT_TYPE.DIR: 
                const dirContent = flagList.has('a') ?
                    listingUnit.content :
                    listingUnit.content.filter(it => it.name[0] !== '.');

                return flagList.has('l') ?
                    dirContent.map(fsUnit => lsRenderFullLine(fsUnit)).join('<br>') :
                    dirContent.map(fsUnit => lsRenderOneLine(fsUnit)).join('&nbsp;&nbsp;'); 
            default:
                return ''
        }
    }
}

/**
 * Print the name of the current/working directory.
 */
builtInCommands.pwd = {
    about: "pwd<br>&nbsp;&nbsp;Print the name of the current working directory.",
    exe: function () {
        return term.tmp_fs.pwd();
    }
}

/**
 * Reset the local storage data for this app.
 **/
builtInCommands.reboot = {
    about: "reboot<br>&nbsp;&nbsp;Reboot the terminal and reset saved environment.",
    exe: function () {
        localStorage.removeItem("filesystem");
        localStorage.removeItem("history");
        term.initSession();
        term.bootTerminalStart(document.getElementById("terminal"));
        return "";
    }
};

/**
 * Delete a file with the given name.
 **/
builtInCommands.rm = {
    about: "rm [name]<br>&nbsp;&nbsp;Delete the file with the specified name in the current directory.",
    exe: function (args) {
        if(args.length == 1){
            return "No filename specified.";
        }
        if(args.length > 2){
            return "Too many parameters supplied.";
        }
        var result = term.deleteFile(args[1]);
        if(result !== true){
            return result;
        }
        return "";
    }
}

/**
 * Create an empty file with the given name.
 **/
builtInCommands.touch = {
    about: "touch [name]<br>&nbsp;&nbsp;Create a file with the specified name in the current directory.",
    exe: function (args) {
        if(args.length == 1){
            return "No filename specified.";
        }
        if(args.length > 2){
            return "Too many parameters supplied.";
        }
        var result = term.makeFile(args[1]);
        if(result !== true){
            return result;
        }
        return "";
    }
}

/**
 * Get the version, author and repo information for Terminal Faker.
 */
builtInCommands.version = {
    about: "version<br>&nbsp;&nbsp;Display the version and attribution of this terminal application.",
    exe: function () {
        return "Terminal Faker: version " + version + " (https://github.com/syntaxseed/terminalfaker) by Sherri Wheeler.";
    }
};
