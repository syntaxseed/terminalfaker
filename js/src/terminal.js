/**
 * In PROGRESS :
 * When rebooting - run the boot loader. Currently it's doing so, then clearing the prompt. I think.
 * Refactoring - created a Path class. Use it!
 */

var version = '1.7.1';  // Used in various commands.

function Path() {

    this.path = "/";

    /**
     * Determine if the passed value is the proper format for a directory.
     */
    Path.prototype.isValidDirectory = function (filename) {
        if (filename == '') {
            return false;
        }
        var newFilename = filename.replace(/[^A-Za-z\d\-_~]/, '');   // Remove all but allowed chars.
        if (newFilename.length != filename.length) {
            return false;
        }
        return true;
    };

    /**
     * Determine if the passed value is the proper format for a file name.
     */
    Path.prototype.isValidFilename = function (filename) {
        if (filename == '') {
            return false;
        }
        var newFilename = filename.replace(/[^A-Za-z\d\.\-_~]/, '');   // Remove all but allowed chars.
        newFilename = newFilename.replace(/^\.|\.$/g, '');  // Remove periods if at beginning or end.
        if (newFilename.length != filename.length) {
            return false;
        }
        // Check for more than 1 period.
        var foundPeriods = newFilename.match(/\./g);
        if (foundPeriods != null && foundPeriods.length > 1) {
            return false;
        }
        return true;
    };

    /**
     * Determine if the passed value is the proper format for a directory path (no file name at end).
     */
    Path.prototype.isValidDirectoryPath = function (filename) {
        if (filename == '') {
            return false;
        }
        var newFilename = filename.replace(/[^A-Za-z\d\/\-_~]/, '');   // Remove all but allowed chars.
        newFilename = newFilename.replace(/(\/)\/+/g, "$1");    // Remove any double slashes.
        if (newFilename.length != filename.length) {
            return false;
        }
        return true;
    };

    /**
     * Get the directory part of a filepath. What's before the final slash. Add a final slash if not there.
     * assumeDirectory - if true, no slashes means assume it's meant to be a directory name.
     */
    Path.prototype.getDirectoryPart = function (filepath, assumeDirectory) {
        var dirs = '';
        if (filepath == '') {
            return false;
        }
        if (assumeDirectory && this.isValidDirectory(filepath)) {
            dirs = filepath;
        } else if (!assumeDirectory && this.isValidFilename(filepath)) {
            return false;
        } else {
            dirs = filepath.substring(0, filepath.lastIndexOf("/"));  // The path without the trailing portion.
        }
        return dirs + "/";
    };

    /**
     * Get the ending part of a filepath (the filename). What's after the final slash.
     * assumeFile - if true, no slashes means assume it's meant to be a directory name.
     */
    Path.prototype.getFilenamePart = function (filepath, assumeFile) {
        if (filepath == '') {
            return false;
        }
        if (assumeFile && this.isValidFilename(filepath)) {
            return filepath;
        } else if (!assumeFile && this.isValidDirectory(filepath)) {
            return false;
        }
        var name = filepath.split('\\').pop().split('/').pop(); // Get the final part (file name).
        if (name == '') {
            return false;
        }
        return name;
    };

    /**
     * Parse a path into a selector for finding a directory node.
     */
    Path.prototype.parseDirPathToSelector = function (path) {
        if (path == "/" || path == "~") {
            return "d[path='/'][name='/']";
        }
        path = path.replace(/\/+$/, "");  // Remove trailing slash.
        var name = path.split('\\').pop().split('/').pop();  // Get the last part - either a file name or a dir name without a trailing slash.
        var dirs = path.substring(0, path.lastIndexOf("/") + 1);  // The path without the trailing portion.
        return "d[path='" + dirs + name + "/'][name='" + name + "']";  // Create a node selector for a directory.
    };

    /**
     * Parse a path with filename into a selector for finding a file node.
     */
    Path.prototype.parseFilePathToSelector = function (path) {
        var name = path.split('\\').pop().split('/').pop(); // Get the final part (file name).
        var dirs = path.substring(0, path.lastIndexOf("/") + 1);  // The path without the trailing portion.
        return "f[path='" + dirs + "'][name='" + name + "']";  // Create a node selector for a file.
    };
};

var Terminal = (function () {
    var self = {};
    self.pathMgr = new Path();

    var KEY_UP = 38,
        KEY_DOWN = 40,
        KEY_TAB = 9,
        MAX_HISTORY = 20;

    //var path ="/";

    // Auxiliary functions

    var resetPrompt = function (terminal, prompt, clear) {

        var newPrompt = prompt.parentNode.cloneNode(true);

        // Make sure all other prompts are no longer editable:
        var promptsAll = document.querySelectorAll("[contenteditable=true]");
        for (var i = 0; i < promptsAll.length; i++) {
            promptsAll[i].setAttribute("contenteditable", false);
        }

        if (self.prompt) {
            newPrompt.querySelector(".prompt").textContent = self.prompt;
        }
        if ((typeof clear !== 'undefined') && clear) {
            while (terminal.firstChild) terminal.removeChild(terminal.firstChild);
        }
        terminal.appendChild(newPrompt);
        newPrompt.querySelector(".prompt").innerHTML = self.customPrompt();
        newPrompt.querySelector(".input").innerHTML = " ";
        newPrompt.querySelector(".input").focus();
    };


    var runCommand = function (terminal, cmd, args) {
        terminal.innerHTML += "<div>" + (self.commands[cmd].exe(args)) + "</div>";
    };

    var updateHistory = function (cmd) {
        if (self.history.length >= MAX_HISTORY) {
            self.history.shift();
        }
        self.history.push(cmd);
        localStorage.setItem("history", self.history);
        self.historyIndex = self.history.length;
    };

    var browseHistory = function (prompt, direction) {
        var changedPrompt = false;
        if (direction == KEY_UP && self.historyIndex > 0) {
            prompt.textContent = self.history[--self.historyIndex];
            changedPrompt = true;
        } else if (direction == KEY_DOWN) {
            if (self.historyIndex < self.history.length)++self.historyIndex;
            if (self.historyIndex < self.history.length) prompt.textContent = self.history[self.historyIndex];
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
    };

    var autoCompleteInput = function (input) {
        var cmds = self.commands,
            re = new RegExp("^" + input, "ig"),
            suggestions = [];
        for (var cmd in cmds) {
            if (cmds.hasOwnProperty(cmd) && cmd.match(re)) {
                suggestions.push(cmd);
            }
        }
        return suggestions;
    };

    var saveFilesystem = function () {
        var strFilesystem;
        if (typeof (XMLSerializer) !== 'undefined') {
            strFilesystem = (new XMLSerializer()).serializeToString(self.filesystem);
        } else if ('outerHTML' in self.filesystem) {
            strFilesystem = self.filesystem.outerHTML;
        } else {
            strFilesystem = originalFilesystem; // Saving doesn't work.
        }
        localStorage.setItem("filesystem", strFilesystem);
    }


    // Terminal functions

    self.bootTerminalStart = function (terminal) {

        var defaultLine = "Type 'help' to get started.";
        if (typeof bootMessageLines === 'undefined') {
            bootMessageLines = [defaultLine];
        }

        if ((typeof useBootLoader !== 'undefined') && !useBootLoader) {
            bootMessageLines = [defaultLine];
        }
        var boot = document.getElementById("boot");
        if (boot == null) {
            var bootElement = document.createElement('p');
            bootElement.setAttribute('id', 'boot');
            terminal.insertBefore(bootElement, terminal.firstChild);
        }
        boot = document.getElementById("boot");
        self.bootTerminalMessage(terminal, boot, bootMessageLines, 0);
    };

    self.bootTerminalMessage = function (terminal, bootElement, introLines, num) {
        if (num == 0) {
            // First hide the prompt and clear any defaul message:
            terminal.querySelector(".hidden").style.display = 'none';
            bootElement.innerHTML = "";
        }
        bootElement.innerHTML += introLines[num];
        if (num + 1 in introLines) {
            // If we have more lines, add the next afer a delay.
            setTimeout(function () {
                self.bootTerminalMessage(terminal, bootElement, introLines, num + 1);
            }, 500);
        } else {
            terminal.querySelector(".hidden").style.display = ''; // Show the prompt.
            terminal.querySelector(".input").focus();
        }
    };

    self.catFile = function (path) {
        // First, is the path present in the current location (add given path to the current path)?
        var foundNode = null;
        var selector = '';
        if (path.substr(0, 1) != '/') {
            // Search in and below current directory (add given path to the current path):
            var selector = self.pathMgr.parseFilePathToSelector(self.path + path);
            var foundNode = self.filesystemPointer.querySelector(selector);
        }
        if (typeof foundNode === 'undefined' || foundNode == null || foundNode.nodeName != 'f') {
            // Not found in current directory, search globally:
            selector = self.pathMgr.parseFilePathToSelector(path);
            var foundNode = self.filesystem.querySelector(selector);
            if (typeof foundNode === 'undefined' || foundNode == null || foundNode.nodeName != 'f') {
                return false;
            }
        }

        // We found a node! Output the file contents.
        return foundNode.querySelector('contents').innerHTML;
    }

    self.changeDirectory = function (path) {
        if (path == "..") {
            // Go up one level as long as we aren't already at the filesystem root.
            if (self.filesystemPointer.getAttribute('name') != "/") {
                self.filesystemPointer = self.filesystemPointer.parentNode.parentNode; // Skip the children (c) element.
                self.path = self.filesystemPointer.getAttribute('path');
                path = self.path;
                return true;
            }
            return true;
        }

        // We are looking for the current directory.
        if (path == ".") {
            return true;
        }

        if (!self.pathMgr.isValidDirectoryPath(path)) {
            return false;
        }

        // Search for the directory.
        var foundNode = self.findDirectory(path);
        if (foundNode === false) {
            return false;
        }

        // We found a node! Update the saved pointer and path.
        self.path = foundNode.getAttribute('path');
        if (self.path.substr(-1) != '/') self.path += '/'; // If there isn't a trailing slash, add one.
        path = self.path;
        self.filesystemPointer = foundNode;

        return true;
    };

    /**
     * Returns the filesystem node at the given path. False if not found.
     * Searches relative to the current path first.
     */
    self.findDirectory = function (path) {
        var foundNode = null;
        var selector = '';
        if (path.substr(0, 1) != '/') {
            // Search in and below current directory (add given path to the current path):
            var selector = self.pathMgr.parseDirPathToSelector(self.path + path);
            var foundNode = self.filesystemPointer.querySelector(selector);
        }
        if (typeof foundNode === 'undefined' || foundNode == null || foundNode.nodeName != 'd') {
            // Not found in current directory, search globally:
            selector = self.pathMgr.parseDirPathToSelector(path);
            var foundNode = self.filesystem.querySelector(selector);
            if (typeof foundNode === 'undefined' || foundNode == null || foundNode.nodeName != 'd') {
                return false;
            }
        }
        return foundNode;
    };

    /**
     * Delete a file in the current directory with the given name.
     * @TODO - Does not yet support providing a path. Uses current dir.
     * First check if it exists.
     */
    self.deleteFile = function (fileName) {
        if (!self.pathMgr.isValidFilename(fileName)) {
            return "rm: Supplied filename is not valid.";
        }

        var currentDirChildren = self.filesystemPointer.querySelector('c');
        var fileFound = currentDirChildren.querySelector("f[path='" + self.path + "'][name='" + fileName + "']");

        if (fileFound === null) {
            return "rm: No such file.";
        }

        currentDirChildren.removeChild(fileFound);
        saveFilesystem();

        return true;
    };

    /**
     * Create an empty file in the current directory with the given name.
     * @TODO - Does not yet support providing a path. Uses current dir.
     * First check if it already exists.
     */
    self.makeFile = function (fileName) {
        if (!self.pathMgr.isValidFilename(fileName)) {
            return "touch: Supplied filename is not valid.";
        }

        var currentDirChildren = self.filesystemPointer.querySelector('c');
        var fileFound = currentDirChildren.querySelector("f[path='" + self.path + "'][name='" + fileName + "']");

        if (fileFound != null) {
            return "touch: File already exists.";
        }

        var file = document.createElement('f');
        file.setAttribute("name", fileName);
        file.setAttribute("path", self.path);
        file.innerHTML = "<contents></contents>";

        currentDirChildren.appendChild(file);
        saveFilesystem();

        return true;
    };


    self.init = function (elem, commands, customPrompt) {
        self.commands = commands;
        self.customPrompt = customPrompt;

        self.initSession();

        elem.addEventListener("keydown", function (event) {
            if (event.keyCode == KEY_TAB) {
                var prompt = event.target;
                var suggestions = autoCompleteInput(prompt.textContent.replace(/\s+/g, ""));

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

        elem.addEventListener("keyup", function (event) {
            if (self.historyIndex < 0) return;
            browseHistory(event.target, event.keyCode);
        });

        elem.addEventListener("keypress", function (event) {
            var prompt = event.target;
            if (event.keyCode != 13) return false;

            var enteredComand = prompt.textContent.trim();

            // Split entered command by spaces, but not spaces in quotes.
            var input = enteredComand.match(/(?=\S)[^"\s]*(?:"[^\\"]*(?:\\[\s\S][^\\"]*)*"[^"\s]*)*/g);

            if (input == null) {
                resetPrompt(elem, prompt, false);
                event.preventDefault();
                return;
            }

            // Remove surrounding quotes if any.
            input = input.map(function (e) {
                if (e.charAt(0) === '"' && e.charAt(e.length - 1) === '"') {
                    return e.substr(1, e.length - 2);
                } else {
                    return e;
                }
            });

            if (input[0]) {
                if (input[0].toLowerCase() in self.commands) {
                    runCommand(elem, input[0].toLowerCase(), input);
                    updateHistory(prompt.textContent);
                } else {
                    elem.innerHTML += input[0] + ": command not found";
                }
            }

            // Reset the prompt, and the given array of command also clear the screen.
            resetPrompt(elem, prompt, (['clear', 'reboot'].indexOf(input[0].toLowerCase()) >= 0));
            event.preventDefault();
        });

        elem.querySelector(".prompt").innerHTML = self.customPrompt();
        elem.querySelector(".input").focus();

        self.term = elem;

        // Run the custom boot loader, unless disabled.
        //if ((typeof useBootLoader === 'undefined') || useBootLoader) {
        self.bootTerminalStart(document.getElementById("terminal"));
        //}

        return self;
    };

    /**
     * Initialize the session for this terminal (ie 'saved' data and current location.)
     */
    self.initSession = function () {

        self.history = (localStorage.getItem("history") ? localStorage.getItem("history").split(",") : []);
        self.historyIndex = self.history.length;

        var fileSystemStr = (localStorage.getItem("filesystem") ? localStorage.getItem("filesystem") : originalFilesystem);
        self.filesystem = (new DOMParser).parseFromString(fileSystemStr, "text/xml");

        self.path = "/";
        path = self.path;
        self.filesystemPointer = self.filesystem.querySelector('d');
    }

    return self;
})();

// extendObject function
function extendObject(n, r) { for (var e in r) r.hasOwnProperty(e) && (n[e] = r[e]); return n }
