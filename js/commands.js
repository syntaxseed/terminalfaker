/**
 * Custom Terminal Commands
 * -----------------------------
 * In this file, define custom commands for your terminal application.
 * This will overwrite any built-in system commands if they exist.
 */
var customCommands = {};

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
    about: "hello [arg ...]<br>&nbsp;&nbsp;Greet the user with a message.",
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
