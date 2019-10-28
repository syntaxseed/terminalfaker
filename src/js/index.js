import './version';
import { TerminalCommands } from './app/Cmd';
import { Terminal } from "./app/Terminal";
import { bootMessageLines } from "./boot";
import { initialFilesystem } from './filesystem';

// console.log(customCommands);
// console.log(myFileSystem);

const termFaker = new Terminal({
  useBootLoader: true,
  bootMessageLines: bootMessageLines
});

// Set the command prompt style:
const customPrompt = () => { return "guest@TermFake ("+termFaker.path+") $ ";};

// Initialize & show the terminal:
termFaker.init(
  document.getElementById("terminal"),
  new TerminalCommands(termFaker),
  customPrompt,
  initialFilesystem
);