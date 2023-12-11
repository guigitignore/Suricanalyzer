import { createServer } from "node:net";
import { createInterface } from "node:readline";
import { spawn } from "node:child_process";
import { existsSync,unlinkSync } from "node:fs";
import { DEBUG } from ".";

const SOCKET_FILE:string="/tmp/suricata.sock";

export function runSuricata(pcap:string,options:{suricata?:string,rules?:string,yaml?:string}):Promise<Array<Record<string,any>>>{
    return new Promise((resolve,reject)=>{
        //command line options
        var suricataArgs=[
            "-r",pcap,
            "-l",process.cwd(),
            "--set","outputs.0.fast.enabled=false",
            "--set","outputs.7.stats.enabled=false",
            "--set","logging.outputs.1.file.enabled=false",
            "--set","outputs.1.eve-log.filetype=unix_stream",
            "--set",`outputs.1.eve-log.filename=${SOCKET_FILE}`,
            "--set","outputs.9.file-store.enabled=yes"
        ];

        //if rules are given we add option
        if (options.rules) suricataArgs.push("-S",options.rules);
        if (options.yaml) suricataArgs.push("-c",options.yaml);
    
        var jsonData:Array<Record<string,any>>=[];
        
        //create socket server to receive data
        var unixServer = createServer((socket)=>{
            socket.setEncoding("utf-8");
            //read data line by line
            const rl=createInterface(socket);
            rl.on('line',(data)=>jsonData.push(JSON.parse(data)));
        
        });

        // remove existing socket file (should not exist unless we kill the program)
        if (existsSync(SOCKET_FILE)){
            unlinkSync(SOCKET_FILE);
        }

        unixServer.listen(SOCKET_FILE,()=>{
            if (DEBUG){
                console.debug("Running suricata...");
            }
            
            var child=spawn(options.suricata as string,suricataArgs);
            var errors:Array<String>=[];

            if (DEBUG) child.stdout.on('data', (data) => console.debug(data.toString("utf-8")));
            child.stderr.on('data', (data) => errors.push(data.toString("utf-8")));
            
            //we resolve promise when suricata exit
            child.on('exit', (code) => {
                unixServer.close();
                if (code==0){
                    resolve(jsonData);
                }else{
                    reject(errors);
                }
            }); 

            child.on('error',()=>{
                unixServer.close();
                reject("Cannot run suricata");
            })
        });
    
        unixServer.on("error",()=>reject("Cannot open socket server"));
    })
}
