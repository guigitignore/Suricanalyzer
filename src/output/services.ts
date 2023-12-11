import { RstDocument, RstSubtitle } from "../rst";
import { RstUtils } from "../rstutils";
import { DEBUG } from "..";
import { isPrivate } from "ip";

//this function tries to retrieve a service name from ip/port/data
function getService(address:string,port:number,data:Record<string,any>):string|void{
    // not a server
    if (port>32000) return;
    // return app_proto if field has a valid value
    if (data.app_proto!='failed') return data.app_proto;

    //try to match port otherwise
    switch (port){
        case 389:
            return 'ldap';

        default:
            if (DEBUG){
                console.debug("Protocol not supported");
                console.debug(data);
            }
            return;
    }

}

export function handleServices(data:Array<Record<string,any>>,document:RstDocument){

    const services=new Set<string>();
    
    data.forEach(elt=>{
        if (elt['event_type']!='flow') return;
        //filter
        if (!('src_ip' in elt && 'dest_ip' in elt)) return;
        if (!('proto' in elt)) return;
        if (!('src_port' in elt && 'dest_port' in elt)) return;
        if (elt.proto!='TCP') return;

        const sourceIP:string=elt["src_ip"];
        const destinationIP:string=elt["dest_ip"];
        const sourcePort:number=elt["src_port"];
        const destinationPort:number=elt["dest_port"];

        //if source or destination IP is private
        if (isPrivate(sourceIP)){
            //get the service name
            const result=getService(sourceIP,sourcePort,elt);
            if (result) services.add(result);
        }

        if (isPrivate(destinationIP)){
            const result=getService(destinationIP,destinationPort,elt);
            if (result) services.add(result);
        }

    })

    if (services.size){
        document.push(new RstSubtitle("TCP/IP services used:"));
        document.push(RstUtils.bulletListFromStringSet(services));
        document.newLine();
    }
}