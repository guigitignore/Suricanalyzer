import { RstDocument, RstSubtitle } from "../rst";
import { RstUtils } from "../rstutils";

export function handleFiles(data:Array<Record<string,any>>,document:RstDocument,malwareFid:Set<number>){
    const correlation=new Set<number>();

    const filesInfo:Record<number,Array<Record<string,any>>>={};

    data.forEach(elt=>{
        //filter fileinfo
        if (elt["event_type"]!='fileinfo') return;

        //sort events by tx_id
        if (!(elt.fileinfo.tx_id in filesInfo)) filesInfo[elt.fileinfo.tx_id]=new Array<Record<string,any>>();
        filesInfo[elt.fileinfo.tx_id].push(elt);
        
        //find correlation
        if (malwareFid.has(elt['flow_id'])){
            correlation.add(elt.fileinfo.tx_id);
        }
        
    })

    if (correlation.size){
        const result=new Array<string>();

        correlation.forEach(corr=>{
            //for each correlation find other flow_id associated
            filesInfo[corr].forEach(file=>{
                result.push(`flow_id: ${file.flow_id} , tx_id: ${file.fileinfo.tx_id}, sha256: ${file.fileinfo.sha256}`);
            })
        })

        document.push(new RstSubtitle("Files associated with malware traffic:"))
        document.push(RstUtils.bulletListFromStringSet(result));
    }

    
}