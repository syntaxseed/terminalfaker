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
    about:  "cow [arg]<br>&nbsp;&nbsp;What does the cow say? And to whom?",       // Help text for this command.
    exe:  function(args) {                  // A closure which is executed for this command. args[0] contains the command name.
        if(args.length < 2){
            return "Moooooo!";
        }
        return "Moooooo to "+ args[1] + "!";
    }
};
