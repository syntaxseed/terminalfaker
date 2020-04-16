/**
 * Custom Terminal Commands
 * -----------------------------
 * In this file, define custom commands for your terminal application.
 * This will overwrite any built-in system commands if they exist.
 */
var customCommands = {};

/**
 * Base64 encodes a string.
*/
builtInCommands.base64enc = {
    about: "base64enc [string]<br>&nbsp;&nbsp;Base64 encode a string.",
    exe: function (args) {
        if(args.length == 1){
            return "No string specified.";
        }
        args.shift();
        return btoa(args.join(" "));
    }
}

/**
 * Base64 decodes a string.
*/
builtInCommands.base64dec = {
    about: "base64dec [string]<br>&nbsp;&nbsp;Base64 decode a string.",
    exe: function (args) {
        if(args.length == 1){
            return "No string specified.";
        }
        args.shift();
        return atob(args.join(" "));
    }
}

/**
 * Print a simple message.
 **/
customCommands.cow = {
    about:  "cow<br>&nbsp;&nbsp;What does a cow say?",     // Help text for this command.
    exe:  function() {                                     // Executed for this command.
            return "Moooooo!";
    }
};

/**
 * Prints a greeting to the user or to the given name.
 **/
customCommands.hello = {
    about: "hello [name ...]<br>&nbsp;&nbsp;Greet the user with a message.",
    exe: function (args) {                          // Executed for this command. args[0] contains the command name.
        if (args.length < 2) {
            return "Hello. Why don't you tell me your name?";
        }
        var name = "";
        for (var i = 1; i < args.length; i++) {
            name += args[i] + " ";
        }
        return "Hello " + name.trim();
    }
};

/**
 * Print a simple message.
 **/
customCommands.secret = {
    about:  "secret<br>&nbsp;&nbsp;A command that is not listed in the help.",  // Help text for this command.
    hidden: true,                                                               // Whether to hide this command from the help list.
    exe:  function() {                                                          // Executed for this command.
            return "The password is: goldfish";
    }
};

// Use the commands in this file, to extend the built-in commands:
var commands = extendObject(builtInCommands, customCommands);
