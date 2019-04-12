Terminal Faker
===========

An extensible pseudo-terminal in Javascript.

## What's this?
Terminal Faker is a Javascript terminal emulation for use in the browser. Originally forked from AVGP/Terminal.js.


There is a [live demo here](https://syntaxseed.github.io/terminalfaker/).

You can do a bunch of things with it:

- Create a CLI-style API interface that runs in the browser
- Create a remote terminal emulator for something that exposes an interface in a browser-consumable way (CORS, Websocket, WebRTC, ...)
- Create a text-based adventure game in the browser
- whatever you can come up with, where a command line interface is useful.

## How do I use it?
It's really easy:

1. You include the ``terminal.css`` and ``terminal.js`` files and have a container element (e.g. a div) with a child element holding a contenteditable element of class ``input`` and another span with the actual prompt line you wanna display.
2. You create an object with methods that will be your commands (see below for the details of how this works)
3. Call terminal.init and pass the container element and your commands object - **Ready to roll!**

Here's a minimal example:

```html
  <div id="terminal">
    <p>Type 'help' to get started.</p>
    <p class="hidden">
      <span class="prompt"></span>
      <span contenteditable="true" class="input"> </span>
    </p>
  </div>
  <script src="terminal.js"></script>
  <script>
    var commands = {};
    commands.hello = {
          about:  "Greet the user with a message.",
          exe:  function(args) {
            if(args.length < 2) return "<p>Hello. Why don't you tell me your name?</p>";
            return "Hello " + args[1];
          }
    };

    // Set the command prompt style:
    var customPrompt = function () { return "user@terminal.js &sim;&gt; ";};

    // Initialize the terminal:
    Terminal.init(document.getElementById("terminal"), commands, customPrompt);
  </script>
```

## Extensible command interface

The terminal is only a way to interact with "commands" and "commands" are a bundles of functionality.
So to use the terminal, you'll need to create a bunch of functions that actually do something - and that's not hard.

### A greeting command
So let's build a command that greets the user with the name she enters, like this:

```bash
$ hello Alice
Hi there, Alice
```

in Terminal.js this is done by creating a ``commands`` object and add a "hello" method to it.
That method will take one parameter, which will be the array of arguments (separated by spaces) entered to call the command and returns HTML to be displayed in the terminal.

```javascript
var commands = {
  hello: function(args) {
    if(args.length < 2) return "<div>Please tell me your name like this: <pre>hello Alice</pre></div>";
    return "<div>Hi there, " + args[1] + "</div>";
  }
};
```

Note that the ``args`` array's first element is the name of the command itself.

Now we can make our terminal (I left parts of the HTML out, see ``index.html`` for a full example):

```html
<div id="terminal">
  <p>
    <span>$ </span>
    <span contenteditable="true" class="input"></span>
  </p>
</div>
<script>
var commands = {
  hello: function(args) {
    if(args.length < 2) return "<div>Please tell me your name like this: <pre>hello Alice</pre></div>";
    return "<div>Hi there, " + args[1] + "</div>";
  }
};

terminal.init(document.getElementById("terminal"), commands);
</script>
```
and we're done. We have a terminal that can greet the user :)


# License
MIT License - basically: Do whatever you feel like, but don't sue me when it blows up.
