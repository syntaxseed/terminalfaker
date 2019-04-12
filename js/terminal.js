var version = '1.1.1';  // Used in various commands.

var Terminal = (function() {
    var history = (localStorage.getItem("history") ? localStorage.getItem("history").split(",") : []),
        historyIndex = history.length,
        self = {};

    var KEY_UP   = 38,
        KEY_DOWN = 40,
        KEY_TAB  = 9,
        MAX_HISTORY = 20;

    // Auxiliary functions

    var resetPrompt = function(terminal, prompt, clear=false) {
        var newPrompt = prompt.parentNode.cloneNode(true);
        prompt.setAttribute("contenteditable", false);
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

    // Terminal functions

    self.bootTerminalMessage = function(terminal, bootElement, introLines, num) {
        if(num == 0){
            terminal.querySelector(".hidden").style.display = 'none'; // Hide the prompt.
            bootElement.innerHTML = "";
        }
        bootElement.innerHTML += introLines[num];
        if( num+1 in introLines){
            setTimeout(function() {
                self.bootTerminalMessage(terminal, bootElement, introLines, num+1);
            },500);
        }else{
            terminal.querySelector(".hidden").style.display = ''; // Show the prompt.
        }
    };

    self.init = function(elem, commands, customPrompt) {
        self.commands = commands;

        self.customPrompt = customPrompt;

        self.history = history;
        self.historyIndex = historyIndex;

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
