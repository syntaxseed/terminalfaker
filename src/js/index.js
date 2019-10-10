import './version';
import { CustomTerminalCommands } from './app/CustomCmd';
import { Terminal } from "./app/Terminal";
import { bootMessageLines } from "./boot";
import { initialFilesystem } from './filesystem';

console.log(myCustomCommands);
console.log(myFileSystem);

const termFaker = new Terminal({
  useBootLoader: true,
  bootMessageLines: bootMessageLines
});

// Set the command prompt style:
const customPrompt = () => { return "guest@TermFake ("+termFaker.path+") $ ";};

// Initialize & show the terminal:
termFaker.init(
  document.getElementById("terminal"), 
  new CustomTerminalCommands(termFaker), 
  customPrompt, 
  initialFilesystem
);