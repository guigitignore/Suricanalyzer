import { createReadStream } from "fs";
import { createInterface } from "node:readline";
import { DEBUG } from ".";

//read file
export function readEveFile(path:string):Promise<Array<Object>>{
    return new Promise((resolve,reject)=>{
        var jsonData:Array<Object>=[];
        var failedLines=0;
        var readLines=0;

        const readStream=createReadStream(path);
        readStream.setEncoding("utf-8");
        readStream.on('open',()=>{
            if (DEBUG){
                console.debug(`Reading '${path}'...`)
            }
        })
        
        readStream.on('error',error=>reject(error));

        const lineReader=createInterface(readStream);
        
        lineReader.on('line',(data)=>{
            readLines++;
            //remove comma at the end of the line in case of regular json
            data=data.replace(/,\s*$/, '');
            try{
                //suricata json format must be parsed line by line
                const lineData=JSON.parse(data);
                jsonData.push(lineData)
            }catch{
                failedLines++;
            }
        });

        lineReader.on('close',()=>{
            if (DEBUG){
                console.debug(`read ${readLines} in '${path}'. ${failedLines} failed to be parsed`);
            }
            resolve(jsonData);
        })
    })
    
}