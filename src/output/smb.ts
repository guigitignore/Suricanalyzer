import { RstDocument, RstSubtitle } from "../rst";
import { RstUtils } from "../rstutils";

export function handleSMB(data:Array<Record<string,any>>,document:RstDocument){

    const usedOS=new Set<string>();
    const smbUsers=new Set<string>();

    data.forEach(elt=>{
        if (elt['event_type']!='smb') return;

        const smb=elt['smb'];

        if ('response' in smb){
            usedOS.add(smb['response']['native_os']);
            usedOS.add(smb['response']['native_lm']);
        }
        
        if ("ntlmssp" in smb){
            const ntlmssp=smb["ntlmssp"];
            if (ntlmssp.user) smbUsers.add(ntlmssp.user);
            
        }
        
        
    })

    if (smbUsers.size){
        document.push(new RstSubtitle("SMB users:"));
        document.push(RstUtils.bulletListFromStringSet(smbUsers));
        document.newLine();
    }

    if (usedOS.size){
        document.push(new RstSubtitle("Used Operating Systems:"));
        document.push(RstUtils.bulletListFromStringSet(usedOS));
        document.newLine();
    }

    
}