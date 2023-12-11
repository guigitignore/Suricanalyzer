import { RstDocument, RstSubtitle, RstTextLine } from "../rst";

export function handleTimeStamp(data:Array<Record<string,any>>,document:RstDocument){
    var firstRecord=Infinity;
    var lastRecord=0;
    
    data.forEach(elt=>{
        var date=Date.parse(elt.timestamp);
        if (date<firstRecord) firstRecord=date;
        if (date>lastRecord) lastRecord=date;
    })

    document.push(new RstSubtitle("Timestamp:"));
    document.push(new RstTextLine(`First Record: ${new Date(firstRecord).toString()}`));
    document.push(new RstTextLine(`Last Record: ${new Date(lastRecord).toString()}`));
}