# __Suricanalyzer__

**A typescript CLI to analyze events produced by Suricata**

I have developped this project using suricata version 8.0 (by compiling master branch from suricata's Github repository)

## 1) Dependencies

First you need to install `nodejs` and `npm` with your package manager.

Then you can install project dependencies by going into project root directory `npm install .`

## 2) Compile

For development you just need to compile typescript into javascript: `npm run build`.

Then you can run the project with the syntax: `node . <args>`.

## 3) Installation

You can install the project in your system by typing inside project root directory: `sudo npm install . -g`

You can also generate a package file: `npm pack` and then install the tarball file created in root directory `sudo npm install suricanalyzer-v<XX>.tgz -g`

Once installed, the command `suricanalyzer` should be available in your console.

## 4) Usage

You can display help by using -h / --help option or simply by not providing any options:

Options availables:
  -V, --version                     	output the version number
  -j,--json [json]                  	eve.json path
  -p,--pcap [pcap]            		    pcap to replay
  -s,--suricata [executable]  	        specify suricata path (default: the suricata version installed on system)
  -r,--rules [executable]     	        rules to apply to suricata
  -y,--yaml [yaml]            		    config to give to suricata
  -o,--output [output]       	        rst file to print
  -d,--debug                  		    show debug informations
  -h, --help                  		    display help for command

There is 2 differents modes:

1) You give directly the eve.json produced by suricata by using -j / --json option
2) You give a pcap file to replay. In this case surcanalyzer will launch suricata and you can use options-s , -r and -y.

Examples: `node . -s /path/to/bin/suricata -p res/input.pcap -r res/emerging-all.rules`
          `node . -j res/eve.json`

The program print results in ReStructuredText syntax (rst). If you not provide output path (-o) it will print to console theresults of the analyze.

## 5) Project organization

This project is written in typescript. Sources are located in src folder.

inside src, you will find:

- index.js -> the entry point
- rst.js   -> a RST library to generate file
- rstutils.js -> additional functions for my use cases
- suricataRunner.js -> function to run suricata and return json
- eveReader.js -> function that parse input file
- dataHandler.js -> Analyze json data and call all handler inside output folder

suricataRunner gets output produced by suricata through a socket file created in /tmp directory.

This function also disable all logs file produced by default when you are running suricata.

## 7) Development

You can complete the analysis of result by creating a new file in output folder:

- create a function like this `export function handleDemo(data:Array<Record<string,any>>,document:RstDocument)`
- call the function from dataHandler.js

Because the json format is native to JS, it is really simple to extract informations.
