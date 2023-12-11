//import * as ip from 'ip';

import { handleActiveDirectory } from "./output/ad";
import { handleAlerts } from "./output/alert";
import { handleFiles } from "./output/files";
import { handleIP } from "./output/ip";
import { handleKerberos } from "./output/kerberos";
import { handleServices } from "./output/services";
import { handleSMB } from "./output/smb";
import { handleTimeStamp } from "./output/timestamp";
import { RstDocument,RstTitle,RstBoldText } from "./rst";

export function handleData(data:Array<Record<string,any>>,document:RstDocument){
    document.push(new RstTitle("Analyze Result"));
    document.newLine();

    if (data.length==0){
        document.push(new RstBoldText("No event to analyze."));
        return;
    }else{
        document.push(new RstBoldText(`${data.length} events analyzed.`));
    }

    // display output

    document.newLine(2);
    //call timestamp
    handleTimeStamp(data,document);    
    document.newLine(2);
    //call ip
    handleIP(data,document);
    document.newLine(2);
    handleActiveDirectory(data,document);
    document.newLine(2);
    handleSMB(data,document);
    document.newLine();
    handleKerberos(data,document);
    document.newLine();
    handleServices(data,document);
    document.newLine();
    const malwaresFid=handleAlerts(data,document);
    document.newLine();
    handleFiles(data,document,malwaresFid);
}