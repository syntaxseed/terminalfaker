import { TerminalCommands } from './Cmd';

/**
 * TODO - This file is unused. This is a more object oriented definition of the commands found in /js/customCommands.js. This was started but never used.
 */


/**
 * Custom Terminal Commands
 * In this file, define custom commands for your terminal application.
 * This will overwrite any built-in system commands if they exist.
 */
export class CustomTerminalCommands extends TerminalCommands {
  /**
   * Base64 encodes a string.
   */
  get base64enc() {
    return {
      about: "base64enc [string]<br>&nbsp;&nbsp;Base64 encode a string.",
      exe: (args) => {
        if(args.length == 1){
          return "No string specified.";
        }
        args.shift();
        return btoa(args.join(" "));
      }
    };
  }
  /**
   * Base64 decodes a string.
   */
  get base64dec() {
    return {
      about: "base64dec [string]<br>&nbsp;&nbsp;Base64 decode a string.",
      exe: (args) => {
        if(args.length == 1){
          return "No string specified.";
        }
        args.shift();
        return atob(args.join(" "));
      }
    };
  }

  /**
   * Print a simple message.
   **/
  get cow() {
    return {
      about:  "cow<br>&nbsp;&nbsp;What does a cow say?", // Help text for this command.
      exe: () => {                                       // Executed for this command.
        return "Moooooo!";
      }
    };
  }

  /**
   * Prints a greeting to the user or to the given name.
   **/
  get hello() {
    return {
      about: "hello [name ...]<br>&nbsp;&nbsp;Greet the user with a message.",
      exe: (args) => {                          // Executed for this command. args[0] contains the command name.
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
  }

  /**
   * Prints a greeting to the user or to the given name.
   **/
  get secret() {
    return {
      about:  "secret<br>&nbsp;&nbsp;A command that is not listed in the help.",  // Help text for this command.
      hidden: true,                                                               // Whether to hide this command from the help list.
      exe: () => {                                                          // Executed for this command.
        return "The password is: goldfish";
      }
    };
  }
}
