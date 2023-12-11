import { isPrivate } from "ip";
import { RstDocument, RstSubtitle } from "../rst";
import { RstUtils } from "../rstutils";

function searchHostname(data:Record<string,any>):string|void{
    if ('tls' in data){
        if ('sni' in data.tls) return data.tls.sni;
    }
}

function filterRecordKeys(input:Record<string,string>,...keys:Array<string>):Record<string,string>{
    return keys.reduce((filteredObject, key) => {
        if (input.hasOwnProperty(key)) {
          filteredObject[key] = input[key];
        }
        return filteredObject;
    }, {} as Record<string, string>);
}

export function handleAlerts(data:Array<Record<string,any>>,document:RstDocument):Set<number>{
    const alertSignatures:Record<number,string>={};
    const malwareFamilies=new Set<string>();
    const impactedIps=new Set<string>();
    var IOCs:Record<string,string>={};
    const ipFilter=new Set<string>();

    const flowId=new Set<number>();

    data.forEach(elt=>{
        if (elt['event_type']!='alert') return;

        const alert=elt.alert;
        var malware=false;
        alertSignatures[alert.signature_id]=alert.signature;

        if ('metadata' in alert){
            const metadata=alert.metadata;
            //console.log(elt);

            if ('malware_family' in metadata){
                const malwareFamily:string|Array<string>=metadata.malware_family;
                flowId.add(elt['flow_id']);

                malware=true;
                if (Array.isArray(malwareFamily)){
                    malwareFamily.forEach(fam=>malwareFamilies.add(fam));
                }else{
                    malwareFamilies.add(malwareFamily.toString());
                }

            }
        }

        if ('src_ip' in elt && 'dest_ip' in elt){
            const result=searchHostname(elt);

            if (isPrivate(elt.src_ip)){
                impactedIps.add(elt.src_ip);
                if (malware) ipFilter.add(elt.dest_ip);
                if (result) IOCs[elt.dest_ip]=result;
                else if (!(elt.dest_ip in IOCs)) IOCs[elt.dest_ip]='<unknown hostname>';
            }

            if (isPrivate(elt.dest_ip)){
                impactedIps.add(elt.dest_ip);
                if (malware) ipFilter.add(elt.src_ip);
                if (result) IOCs[elt.src_ip]=result;
                else if (!(elt.src_ip in IOCs)) IOCs[elt.src_ip]='<unknown hostname>';
            }

        }

        
        
    })

    if (Object.keys(alertSignatures).length){
        document.push(new RstSubtitle("Alert Signatures:"))
        document.push(RstUtils.bulletListFromRecord(alertSignatures));
        document.newLine();
    }

    if (malwareFamilies.size){
        document.push(new RstSubtitle("Malware families detected:"));
        document.push(RstUtils.bulletListFromStringSet(malwareFamilies));
        document.newLine();
    }

    if (impactedIps.size){
        document.push(new RstSubtitle("Local IPs impacted by malware:"));
        document.push(RstUtils.bulletListFromStringSet(impactedIps));
        document.newLine();
    }

    IOCs=filterRecordKeys(IOCs,...ipFilter);

    if (Object.keys(IOCs).length){
        document.push(new RstSubtitle("Malicious Hosts:"));
        document.push(RstUtils.bulletListFromRecord(IOCs));
        document.newLine();
    }

    return flowId;
}