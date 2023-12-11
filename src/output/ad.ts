import { RstDocument, RstHorizontalLayout, RstSubtitle } from "../rst";
import { RstUtils } from "../rstutils";

export function handleActiveDirectory(data:Array<Record<string,any>>,document:RstDocument){

    const windowsDomains=new Set<string>();
    const domainControllers=new Set<string>();
    const primaryDomainControllers=new Set<string>();

    data.forEach(elt=>{
        //filter dns
        if (elt['event_type']!='dns') return;

        const dns=elt['dns'];
        if (!('rrname' in dns)) return;
        
        const rrname:string=dns['rrname'];

        //match regex
        if (rrname.match(/^_ldap._tcp/i)){
            windowsDomains.add(rrname);

            if (rrname.match(/dc./i)) domainControllers.add(rrname);
            if (rrname.match(/pdc./i)) primaryDomainControllers.add(rrname);
        }
    })
    
    //display results in document
    if (windowsDomains.size){
        document.push(new RstSubtitle("Active Directory:"));
        document.newLine();

        const layout=new RstHorizontalLayout(1);

        layout.push(RstUtils.verticalGridFromStringSet("Windows Domain",windowsDomains));
    
        if (domainControllers.size) layout.push(RstUtils.verticalGridFromStringSet("Domains Controller",domainControllers));

        if (primaryDomainControllers.size) layout.push(RstUtils.verticalGridFromStringSet("Primary Domains Controller",primaryDomainControllers));

        document.push(layout);
    }
    
}