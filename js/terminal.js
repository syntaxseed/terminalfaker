var version = '1.3.4';  // Used in various commands.

var Terminal = (function() {
    var history = (localStorage.getItem("history") ? localStorage.getItem("history").split(",") : []),
        historyIndex = history.length,
        self = {};

    var KEY_UP   = 38,
        KEY_DOWN = 40,
        KEY_TAB  = 9,
        MAX_HISTORY = 20;

    var path ="/";

    // Auxiliary functions

    var resetPrompt = function(terminal, prompt, clear=false) {
        var newPrompt = prompt.parentNode.cloneNode(true);

        // Make sure all other prompts are no longer editable:
        var promptsAll = document.querySelectorAll("[contenteditable=true]");
        for(var i=0; i<promptsAll.length; i++){
            promptsAll[i].setAttribute("contenteditable", false);
        }

        if(self.prompt) {
            newPrompt.querySelector(".prompt").textContent = self.prompt;
        }
        if(clear){
            while(terminal.firstChild) terminal.removeChild(terminal.firstChild);
        }
        terminal.appendChild(newPrompt);
        newPrompt.querySelector(".prompt").innerHTML = self.customPrompt();
        newPrompt.querySelector(".input").innerHTML = " ";
        newPrompt.querySelector(".input").focus();
    };


    var runCommand = function(terminal, cmd, args) {
        terminal.innerHTML += "<div>" + (self.commands[cmd].exe(args)) + "</div>";
    };

    var updateHistory = function(cmd) {
        if( self.history.length >= MAX_HISTORY ){
            self.history.shift();
        }
        self.history.push(cmd);
        localStorage.setItem("history", self.history);
        self.historyIndex = self.history.length;
    };

    var browseHistory = function(prompt, direction) {
        var changedPrompt = false;
        if(direction == KEY_UP && self.historyIndex > 0) {
            prompt.textContent = self.history[--self.historyIndex];
            changedPrompt = true;
        } else if(direction == KEY_DOWN) {
            if(self.historyIndex < self.history.length) ++self.historyIndex;
            if(self.historyIndex < self.history.length) prompt.textContent = self.history[self.historyIndex];
            else prompt.textContent = " ";
            changedPrompt = true;
        }

        if(changedPrompt) {
            try {
                var range = document.createRange();
                var sel = window.getSelection();
                range.setStart(prompt.childNodes[0], prompt.textContent.length);
                range.collapse(true);
                sel.removeAllRanges();
                sel.addRange(range);
            } catch (err) {}
        }
    };

    var autoCompleteInput = function(input) {
        var cmds        = self.commands,
            re          = new RegExp("^" + input, "ig"),
            suggestions = [];
        for(var cmd in cmds) {
            if(cmds.hasOwnProperty(cmd) && cmd.match(re)) {
                suggestions.push(cmd);
            }
        }
        return suggestions;
    };

    var parseDirPathToSelector = function(path) {
        if(path == "/" || path == "~") return "d[path='/'][name='/']";
        path = path.replace(/\/+$/, ""); // Remove trailing slash.
        var name = path.split('\\').pop().split('/').pop();
        var dirs = path.substring(0, path.lastIndexOf("/")+1);
        return "d[path='"+dirs+name+"/'][name='"+name+"']";
    };
    var parseFilePathToSelector = function(path) {
        var name = path.split('\\').pop().split('/').pop();
        var dirs = path.substring(0, path.lastIndexOf("/")+1);
        return "f[path='"+dirs+"'][name='"+name+"']";
    };

    // Terminal functions

    self.bootTerminalMessage = function(terminal, bootElement, introLines, num) {
        if(num == 0){
            // First hide the prompt and clear any defaul message:
            terminal.querySelector(".hidden").style.display = 'none';
            bootElement.innerHTML = "";
        }
        bootElement.innerHTML += introLines[num];
        if( num+1 in introLines){
            // If we have more lines, add the next afer a delay.
            setTimeout(function() {
                self.bootTerminalMessage(terminal, bootElement, introLines, num+1);
            },500);
        }else{
            terminal.querySelector(".hidden").style.display = ''; // Show the prompt.
            terminal.querySelector(".input").focus();
        }
    };

    self.catFile = function(path){
        // First, is the path present in the current location (add given path to the current path)?
        var foundNode = null;
        var selector = '';
        if(path.substr(0, 1) != '/'){
            // Search in and below current directory (add given path to the current path):
            var selector = parseFilePathToSelector(self.path+path);
            console.log(selector);
            var foundNode = self.filesystemPointer.querySelector(selector);
        }
        if (typeof foundNode === 'undefined' || foundNode == null || foundNode.nodeName != 'f'){
            // Not found in current directory, search globally:
            selector = parseFilePathToSelector(path);
            console.log(selector);
            var foundNode = self.filesystem.querySelector(selector);
            if (typeof foundNode === 'undefined' || foundNode == null || foundNode.nodeName != 'f'){
                return false;
            }
        }

        console.log(foundNode);
        // We found a node! Output the file contents.
        return foundNode.querySelector('contents').innerHTML;

    }

    self.changeDirectory = function(path){
        if( path == ".."){
            // Go up one level as long as we aren't already at the filesystem root.
            if( self.filesystemPointer.getAttribute('name') != "/"){
                self.filesystemPointer = self.filesystemPointer.parentNode.parentNode; // Skip the children (c) element.
                self.path = self.filesystemPointer.getAttribute('path');
                path = self.path;
                return true;
            }
            return true;
        }

        // We are looking for the current directory.
        if( path == "."){
            return true;
        }

        var foundNode = null;
        var selector = '';
        if(path.substr(0, 1) != '/'){
            // Search in and below current directory (add given path to the current path):
            var selector = parseDirPathToSelector(self.path+path);
            var foundNode = self.filesystemPointer.querySelector(selector);
        }
        if (typeof foundNode === 'undefined' || foundNode == null || foundNode.nodeName != 'd'){
            // Not found in current directory, search globally:
            selector = parseDirPathToSelector(path);
            var foundNode = self.filesystem.querySelector(selector);
            if (typeof foundNode === 'undefined' || foundNode == null || foundNode.nodeName != 'd'){
                return false;
            }
        }

        // We found a node! Update the saved pointer and path.
        self.path = foundNode.getAttribute('path');
        if (self.path.substr(-1) != '/') self.path += '/'; // If there isn't a trailing slash, add one.
        path = self.path;
        self.filesystemPointer = foundNode;

        return true;
    };


    self.init = function(elem, commands, customPrompt) {
        self.commands = commands;

        self.customPrompt = customPrompt;

        self.history = history;
        self.historyIndex = historyIndex;

        var fileSystemStr = (localStorage.getItem("filesystem") ? localStorage.getItem("filesystem") : originalFilesystem);
        self.filesystem =(new DOMParser).parseFromString(fileSystemStr,"text/xml");
        self.path = "/";
        path = self.path;
        self.filesystemPointer = self.filesystem.querySelector('d');

        elem.addEventListener("keydown", function(event) {
            if(event.keyCode == KEY_TAB) {
                var prompt = event.target;
                var suggestions = autoCompleteInput(prompt.textContent.replace(/\s+/g, ""));

                if(suggestions.length == 1) {
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

        elem.addEventListener("keyup", function(event) {
            if(self.historyIndex < 0) return;
            browseHistory(event.target, event.keyCode);
        });

        elem.addEventListener("keypress", function(event) {
            var prompt = event.target;
            if(event.keyCode != 13) return false;

            var enteredComand = prompt.textContent.trim();
            var input = enteredComand.split(" ");
            if(input[0]){
                if(input[0].toLowerCase() in self.commands) {
                    runCommand(elem, input[0].toLowerCase(), input);
                    updateHistory(prompt.textContent);
                }else{
                    elem.innerHTML += input[0] + ": command not found";
                }
            }

            resetPrompt(elem, prompt, (input[0].toLowerCase()=='clear'));
            event.preventDefault();
        });

        elem.querySelector(".prompt").innerHTML = self.customPrompt();
        elem.querySelector(".input").focus();

        self.term = elem;
        return self;
    };

    return self;
})();

function extendObject(obj, src) {
    for (var key in src) {
        if (src.hasOwnProperty(key)) obj[key] = src[key];
    }
    return obj;
}
