import { RstDocument, RstSubtitle } from "../rst";
import { RstUtils } from "../rstutils";

export function handleKerberos(data:Array<Record<string,any>>,document:RstDocument){

    const kerberosUsers=new Set<string>();

    data.forEach(elt=>{
        if (elt['event_type']!='krb5') return;

        const kerberos=elt['krb5'];
        const cname:string=kerberos.cname;

        if (cname){
            if (cname!='<empty>' && !cname.endsWith('$')) kerberosUsers.add(cname);
        }
    })

    if (kerberosUsers.size){
        document.push(new RstSubtitle("Kerberos users:"));
        document.push(RstUtils.bulletListFromStringSet(kerberosUsers));
        document.newLine();
    }
    
}