/**
 * The bootloader message that will appear line by line on terminal boot.
 * This is the 'long' format.
 * To skip this, set useBootLoader to false in the on-page configuration.
 * In HTML format.
 */

var bootMessageLines = [
            "System loading...<br>",
            (new Date()).toString()+"<br>",
            "&nbsp;_______&nbsp;&nbsp;&nbsp;______&nbsp;<br>|__&nbsp;&nbsp;&nbsp;__|&nbsp;|&nbsp;&nbsp;____|<br>&nbsp;&nbsp;&nbsp;|&nbsp;|&nbsp;&nbsp;&nbsp;&nbsp;|&nbsp;|__&nbsp;&nbsp;&nbsp;<br>&nbsp;&nbsp;&nbsp;|&nbsp;|&nbsp;&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;__|&nbsp;&nbsp;<br>&nbsp;&nbsp;&nbsp;|&nbsp;|&nbsp;&nbsp;&nbsp;&nbsp;|&nbsp;|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>&nbsp;&nbsp;&nbsp;|_|&nbsp;&nbsp;&nbsp;&nbsp;|_|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>",
            "Terminal Faker version "+version+"<br>",
            "By Sherri Wheeler (SyntaxSeed.com)<br>",
            "Ready. Type 'help' to get started.<br><br>"
        ];
