import { RstDocument, RstGridCell, RstHeaderGridCell, RstSubtitle, RstVerticalGrid, RstHorizontalLayout} from "../rst";
import * as ip from 'ip';
import { RstUtils } from "../rstutils";

export function handleIP(data:Array<Record<string,any>>,document:RstDocument){

    const ipClassA=new Set<string>();
    const ipClassB=new Set<string>();
    const ipClassC=new Set<string>();

    const addIp=(input:string)=>{
        //sort private ip by classes
        if (ip.cidrSubnet("10.0.0.0/8").contains(input)) ipClassA.add(input);
        if (ip.cidrSubnet("172.16.0.0/12").contains(input)) ipClassB.add(input);
        if (ip.cidrSubnet("192.168.0.0/16").contains(input)) ipClassC.add(input);
    }

    data.forEach(elt=>{
        if ('src_ip' in elt) addIp(elt['src_ip']);
        if ('dest_ip' in elt) addIp(elt['dest_ip']);
    })

    const layout=new RstHorizontalLayout();

    if (ipClassA.size) layout.push(RstUtils.verticalGridFromStringSet("10.0.0.0/8",ipClassA));
    if (ipClassB.size) layout.push(RstUtils.verticalGridFromStringSet("172.16.0.0/12",ipClassB));
    if (ipClassC.size) layout.push(RstUtils.verticalGridFromStringSet("192.168.0.0/16",ipClassC));

    if (layout.length){
        document.push(new RstSubtitle("Private IPs used:"));
        document.newLine();
        document.push(layout);
    }

}