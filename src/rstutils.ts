import { RstBoldText, RstBulletList, RstGridCell, RstHeaderGridCell, RstText, RstVerticalGrid } from "./rst";

export class RstUtils{
    static bulletListFromStringSet(input:Set<string>|Array<string>):RstBulletList{
        const result=new RstBulletList();
        input.forEach(elt=>result.push(new RstText(elt)));
        return result;
    }

    static bulletListFromRecord(input:Record<string,string>):RstBulletList{
        const result=new RstBulletList();
        for (const [key,value] of Object.entries(input)){
            result.push(new RstText(key+" : "+value));
        }
        return result;
    }

    static verticalGridFromStringSet(title:string,input:Set<string>|Array<string>):RstVerticalGrid{
        const grid=new RstVerticalGrid(new RstHeaderGridCell(title));
        input.forEach(elt=>grid.push(new RstGridCell(elt)));
        return grid;
    }
}