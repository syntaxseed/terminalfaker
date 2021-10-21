Terminal Faker
===========

<div align="center">
    <img src="https://img.shields.io/github/tag/syntaxseed/terminalfaker.svg"
        alt="GitHub tag (latest SemVer)">
    <img src="https://img.shields.io/badge/JavaScript-ES5-brightgreen.svg"
        alt="Javascript: ES5"><br>
    <a href="https://twitter.com/intent/follow?screen_name=syntaxseed">
        <img src="https://img.shields.io/twitter/follow/syntaxseed.svg?style=social&logo=twitter"
            alt="follow on Twitter"></a>&nbsp;&nbsp;<a href="https://github.com/syntaxseed#donatecontribute"><img src="https://img.shields.io/badge/Sponsor-Project-blue" alt="Sponsor Project" /></a>
</div>

![Logo](favicon.png)

An extensible pseudo-terminal in Javascript.

# What's this?
A pure native Javascript, mobile-friendly, Linux-like terminal simulation for use in a browser. There is a **[live demo here](https://syntaxseed.github.io/terminalfaker/)**.

Originally forked from [AVGP/terminal.js](https://github.com/AVGP/terminal.js).

You can do a bunch of things with it:

- Create a CLI-style API interface that runs in the browser.
- Create a terminal emulator for something that exposes an interface in a browser-consumable way (CORS, Websocket, WebRTC, ...).
- Create a text-based adventure game in the browser.
- Create an educational tool for learning command line applications.
- Etc.

## NOTE: What Happened To WebPack?

Past contributors and users might notice that I have reverted much of what was done to this project over the last year. I greatly apprecitate the many users who contributed updates, especially during Hacktoberfest 2019, however it resulted in this project gaining complexity and dependencies putting it way beyond my ability to understand it or work on it (I'm not primarily a JS dev). The addition of WebPack and other dependencies also meant I was getting security vulnerability warnings on the project frequently. It also became VERY difficult to customize the default filesystem because one contributor had removed the xml format for this. As a result of all these factors, I decided to revert the project to a state where I can understand and work on it. Users who wish to continue with the old version of the project - which had many improvements along with the added complexity and dependencies - can fork the project from the tag "v1.6.4.OLDVERSION". I may slowly add these advanced features and WebPack back into the project in the future, but I'll do it as I learn these myself. Sorry to everyone who spent time contributing.

## How do I use it?

The easiest way to get started is to use the included "index.html" file and modify it for your needs. The basic usage is:

1. Include the "terminal.css" and the "bundle.min.js" & "filesystem.js" files.
2. Have a container element (e.g. a div) with a child element holding a contenteditable element of class "input" and another span of class "prompt" with the actual prompt line you want to display.
3. Create an object with methods that will be your commands (see below for the details of how this works).
4. Call terminal.init and pass the container element, your commands object, and a callback which creates the custom prompt. - **Ready to roll!**

Here's a **minimal** example with one command:

```html
    <div id="terminal">
        <p id="boot">Type 'help' to get started.</p>
        <p class="hidden">
            <span class="prompt"></span>
            <span contenteditable="true" class="input" autocorrect="off" autocapitalize="none" autocomplete="off"> </span>
        </p>
    </div>

    <script src="js/bundle.min.js"></script>
    <script src="js/filesystem.js"></script>

    <script>
    var commands = {};
    commands.cow = {
            about:  "What does the cow say?",
            exe:  function() {
            return "Moooooo!";
            }
    };

    // Set the command prompt style:
    var customPrompt = function () { return "guest@TerminalFaker $ ";};

    // Initialize the terminal:
    var term = Terminal.init(document.getElementById("terminal"), commands, customPrompt);
    </script>
```

## Extensible command interface

The terminal is only a way to interact with "commands" and "commands" are a bundles of functionality.
So to use the terminal, you'll need to create a bunch of functions that actually do something - and that's not hard.

First we modify our minimal example to load in custom commands found in "js/commands.js".

```html
  ...
  <script src="js/bundle.min.js"></script>
  <script src="js/filesystem.js"></script>
  <script src="js/commands.js"></script>
  ...
```

Then, in commands.js we will define custom commands (there are a couple examples in there already for you).

### A greeting command
So let's build a command that greets the user with the name she enters, like this:

```bash
$ hello Alice
Hi there, Alice
```

In commands.js this is done by creating a "customCommands" object and adding a "hello" object to it with an "about" property and a "exe" property.

"customCommands.hello.about" will contain a string of the help info to display if the user types ``help hello``.

"customCommands.hello.exe" will contain the closure to execute when the command is run. It can receive an "args" parameter which is an array of the command line arguments.

In this case, hello will take multiple arguments (separated by spaces), which will be passed into the command as the "args" array and returns HTML to be displayed in the terminal.

```javascript
var customCommands = {};
customCommands.hello = {
    about: "hello [arg ...]<br>&nbsp;&nbsp;Greet the user with a message.",
    exe: function (args) {                          // Executed for this command. args[0] contains the command name.
        if (args.length < 2) {
            return "Hello. Why don't you tell me your name?";
        }
        var name = "";
        // Concatenate all remaining arguments as the 'name'.
        for (var i = 1; i < args.length; i++) {
            name += args[i] + " ";
        }
        return "Hello " + name.trim();
    }
};
```

Note that the "args" array's first element is the name of the command itself.

An optional attribute "hidden: true" can be added to a command definition to hide it from the list of commands shown by "help".

That's it! Now the commands defined in "commands.js" will extend (and overwrite if re-defined) the built-in commands. We have a terminal that can greet the user. :)

## Custom boot message

A boot up message is simulated including delayed line-by line display of the boot text. This message is found in "js/boot.js" and is used by including the file *after* "terminal.js" is included. Your terminal div must contain an element with id of "boot". If you don't want this, just remove the "boot.js" file include. Or, if you are using the minified bundle of js, just set a variable: ``var useBootLoader = false;`` in your javascript.

Note that this will over-write any text already in the element with id "boot".

## A Mock Filesystem

![Basic Filesystem](media/screenshot2.png)

A simulated filesystem is initialized from the default content found in js/filesystem.js. Basic navigation around the filesystem is available. You can edit this file to customize the contents.

## Advanced Example

![Screenshot](media/screenshot1.png)

To see a full example including loading in system commands and the nicer boot message text, see the source of index.html.

## ToDo

* Basic filesystem (in progress).
* Editing of files, mkdir, rmdir, etc.

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## Authors

* **Sherri Wheeler** - *Author & Maintainer* - [SyntaxSeed](https://github.com/SyntaxSeed)
* **Martin Splitt** - *Based on his original Terminal.js* - [AVGP/terminal.js](https://github.com/AVGP/terminal.js)

### Contributors

* **Ben Brunton** - [benbrunton](https://github.com/benbrunton)
* **Sahil Bondre** - [godcrampy](https://github.com/godcrampy)
* **LapinoLapidus** - [LapinoLapidus](https://github.com/LapinoLapidus)

## License

MIT License - basically: Do whatever you feel like, but don't sue me when it blows up.
