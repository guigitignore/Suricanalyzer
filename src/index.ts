#!env node

import { InvalidOptionArgumentError, Option, program } from "commander";
import { textSync } from "figlet";
import {createWriteStream, lstatSync,WriteStream } from "fs";
import { readEveFile } from "./eveReader";
import { runSuricata } from "./suricataRunner";
import { handleData } from "./dataHandler";
import { RstDocument } from "./rst";

//return path if exist or raise appropried error otherwise
const pathChecker=(path:string):string|undefined=>{
    try{
        if (!lstatSync(path).isFile()){
            throw new InvalidOptionArgumentError('the path is not a file');
        }
        return path;
    }catch(error){
        throw new InvalidOptionArgumentError('the path does not exist');
    }
}

//return value if exist and delete the key associated
const getValueAndDeleteKey=(obj: Record<string, any>, key: string): any | undefined =>{
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];
      delete obj[key];
      return value;
    } else {
      return undefined;
    }
}

//print name of the project
console.log(textSync("Suricanalyzer"));

//debug flag shared with other files
export var DEBUG=false;

//argument parser
program.description("Suricata Analyzer");

program.usage("[options]");

program.version("1.0");

program.addOption(
    new Option("-j,--json [json]","eve.json path")
        .argParser(pathChecker)
        .conflicts(['suricata','rules','pcap'])
)

program.addOption(
    new Option("-p,--pcap [pcap]","pcap to replay")
        .argParser(pathChecker)
        .conflicts('json')
)

program.addOption(
    new Option("-s,--suricata [executable]","specify suricata path")
        .argParser(pathChecker)
        .default('suricata',"the suricata version installed on system")
        .conflicts('json')
)

program.addOption(
    new Option("-r,--rules [executable]","rules to apply to suricata")
        .argParser(pathChecker)
        .conflicts('json')
)

program.addOption(
    new Option("-y,--yaml [yaml]","config to give to suricata")
        .argParser(pathChecker)
        .conflicts('json')
)

program.addOption(
    new Option("-o,--output [output]","rst file to print")
)

program.option("-d,--debug","show debug informations")

program.parse(process.argv);

const options=program.opts();

//extract options
const eveJSON=getValueAndDeleteKey(options,'json');
const pcapFile=getValueAndDeleteKey(options,'pcap');
const outputFile=getValueAndDeleteKey(options,'output');
const document=new RstDocument();

if (getValueAndDeleteKey(options,'debug')){
    DEBUG=true;
}

var data;
var promise:Promise<Array<Record<string,any>>>;

//read eve or run suricata
if (eveJSON){
    promise=readEveFile(eveJSON);
}else if (pcapFile){
    promise=runSuricata(pcapFile,options);
}else{
    // by default print help
    console.log(program.helpInformation());
    process.exit(0);
}

promise.then((data)=>{
    //once promise is fullfilled, handle data
    handleData(data,document);
}).then(()=>{
    // then export document
    if (outputFile){
        document.export(outputFile);
    }else{
        document.print();
    }
}).catch(error=>{
    // display error and exit
    console.error(error);
    process.exit(-1);
})