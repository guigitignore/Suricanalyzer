import * as fs from 'fs';

//big library to handle RST files with a programming approach
class RstArrayUtils{
    static splitLines(input:string):Array<string>{
        return input.replace(/\n$/, '').split('\n');
    }

    static getMaxLen(input:Array<string|Array<any>>):number{
        return Math.max(...input.map(elt => elt.length));
    }

    static horizontalPad(input:Array<string>, length:number) {
        return input.map(line => {
            if (line.length < length) {
                return line.padEnd(length);
            }else{
                return line.slice(0, length);
            }
        });
    }

    static verticalPad(input:Array<string>, length:number):Array<string> {
        const result=input.slice(0,length);
        while (result.length<length){
            result.push('');
        }
        return result;
    }

    static padToMax(input:Array<string>):Array<string>{
        return this.horizontalPad(input,this.getMaxLen(input));
    }

    static horizontalAlign(input:Array<Array<string>>):Array<Array<string>>{
        const maxLength = Math.max(...input.map(arr => this.getMaxLen(arr)));
        return input.map(arr=>RstArrayUtils.horizontalPad(arr,maxLength));
    }

    static verticalAlign(input:Array<Array<string>>):Array<Array<string>>{
        const maxLength = this.getMaxLen(input);
        return input.map(arr=>this.verticalPad(arr,maxLength));
    }

    static mergeColumns(input:Array<Array<string>>,separator:string=''):Array<string>{
        // Find the maximum number of columns among all arrays
        const maxColumns = this.getMaxLen(input);

        const mergedArray = [];
        for (let columnIndex = 0; columnIndex < maxColumns; columnIndex++) {
            const mergedColumn = input.map(row => (row[columnIndex] || '').toString()).join(separator);
            mergedArray.push(mergedColumn);
        }

        return mergedArray;
    }
}

export interface RstComponent{
    toString():string;
}


export class RstBasicContainer<Type extends RstComponent> extends Array<Type>{
    public toString(): string {
        return this.lines.join("\n");
    }

    public get lines():Array<string>{
        return this.join("").split('\n');
    }

    public get width():number{
        return RstArrayUtils.getMaxLen(this.lines);
    }

    public get height():number{
        return this.lines.length;
    }
}

export class RstContainer extends RstBasicContainer<RstComponent>{
    private internalWidth:number|undefined
    private internalHeight:number|undefined
    
    public set width(value:number){
        this.internalWidth=value;
    }

    public set height(value:number){
        this.internalHeight=value;
    }

    public resize(width:number,heigth:number){
        this.width=width;
        this.height=heigth;
    }

    protected validateLines(lines:Array<string>):Array<string>{
        if (this.internalHeight!=undefined) lines=RstArrayUtils.verticalPad(lines,this.internalHeight);
        if (this.internalWidth!=undefined) lines=RstArrayUtils.horizontalPad(lines,this.internalWidth);
        return lines;
    }

    public get lines():Array<string>{
        return this.validateLines(super.lines);
    }

    public toString(): string {
        return this.lines.join("\n");
    }
}

export class RstHorizontalLayout extends RstContainer{
    private separator:string;

    public constructor(separation:number=1){
        super();
        this.separator=' '.repeat(separation);
    }

    public get lines():Array<string>{
        const allLines = this.map(elt => elt.toString().split('\n'));
        const paddedArrays=RstArrayUtils.verticalAlign(allLines).map(arr=>RstArrayUtils.padToMax(arr));
        return this.validateLines(RstArrayUtils.mergeColumns(paddedArrays,this.separator));
    }
}

export class RstVerticalLayout extends RstContainer{
    private separation:number

    public constructor(separation:number=0){
        super();
        this.separation=separation;
    }

    public get lines():Array<string>{
        const allLines = this.map(elt => elt.toString().split('\n'));
        const result:Array<string>=[];
        allLines.forEach((lines,index)=>{
            result.push(...lines);
            if (index!=allLines.length-1) result.push(...Array(this.separation).fill(''));
        })

        return this.validateLines(result);
    }
}

export class RstText implements RstComponent{
    private text:string

    public constructor(text:string){
        this.text=text;
    }
    
    public toString(): string {
        return this.text;
    }
}

export class RstTextLine extends RstText{
    public toString(): string {
        return '| '+super.toString()+'\n';
    }
}

export class RstTitle extends RstContainer{
    public constructor(title:string){
        super();
        const bar=new RstText("=".repeat(title.length)+'\n');
        this.push(bar)
        this.push(new RstText(title+'\n'))
        this.push(bar)
    }
}

export class RstSubtitle extends RstContainer{
    public constructor(title:string){
        super();
        this.push(new RstText(title+'\n'))
        this.push(new RstText("-".repeat(title.length)+'\n'))
    }
}

export class RstItalicText extends RstText{
    public constructor(text:string){
        super('*'+text+'*');
    }
}

export class RstBoldText extends RstText{
    public constructor(text:string){
        super('**'+text+'**');
    }
}

export class RstInterpretedText extends RstText{
    public constructor(text:string){
        super('`'+text+'`');
    }
}

export class RstLiteralText extends RstText{
    public constructor(text:string){
        super('``'+text+'``');
    }
}

export class RstReferenceText extends RstText{
    public constructor(text:string){
        super('`'+text+'`_');
    }
}

export class RstBulletList extends RstBasicContainer<RstComponent>{
    public toString(): string {
        return '- '+this.join("\n- ")+'\n';
    }
}

export class RstEnumeratedList extends RstBasicContainer<RstComponent>{
    public toString(): string {
        return this.map((value,index)=>`${index+1}. ${value}\n`).join('');
    }
}

export class RstDocument extends RstBasicContainer<RstComponent>{
    private emptyLine:RstText=new RstText('\n');

    public print(){
        process.stdout.write(this.toString());
        process.stdout.write('\n');
    }

    public export(path:string){
        fs.writeFileSync(path,this.toString());
    }

    public newLine(count:number=1){
        for (var i=0;i<count;i++) this.push(this.emptyLine);
    }
}

abstract class RstBasicGridCell extends RstContainer{
    protected getHorizontalBorder(usedChar:string,length:number):string{
        return '+'+usedChar.repeat(length-2)+'+';
    }

    public abstract getUpperBorder(length:number):string;

    public abstract getLowerBorder(length:number):string;

    private get verticalBorders():Array<string>{
        return super.lines.map(line=>'| '+line+' |');
    }

    public get lines():Array<string>{
        const result=this.verticalBorders;
        const borderLength=result.length?result[0].length:4;
        result.unshift(this.getUpperBorder(borderLength));
        result.push(this.getLowerBorder(borderLength));
        return result;
    }

    public set width(value:number){
        if (value<4) throw new RangeError("value must be greater or equal to 4");
        super.width=value-4;
    }

    public set height(value:number){
        if (value<2) throw new RangeError("value must be greater or equal to 2");
        super.height=value-2;
    }
}

export class RstGridCell extends RstBasicGridCell{
    public getUpperBorder(length: number): string {
        return this.getHorizontalBorder('-',length);
    }
    public getLowerBorder(length: number): string {
        return this.getHorizontalBorder('-',length);
    }
   
}

export class RstHeaderGridCell extends RstBasicGridCell{
    public getUpperBorder(length: number): string {
        return this.getHorizontalBorder('-',length);
    }
    public getLowerBorder(length: number): string {
        return this.getHorizontalBorder('=',length);
    }
}

export class RstHorizontalGrid extends RstBasicContainer<RstBasicGridCell>{
    public get lines(): Array<string> {
        const maxHeight=RstArrayUtils.getMaxLen(this.map(elt=>elt.lines));
        return RstArrayUtils.mergeColumns(this.map((elt,index)=>{
            elt.height=maxHeight;
            if (index!=0) return elt.lines.map(line=>line.slice(1));
            return elt.lines;
        }))
    }
}

export class RstVerticalGrid extends RstBasicContainer<RstBasicGridCell>{
    public get lines(): Array<string> {
        const maxWidth=Math.max(...this.map(elt=>RstArrayUtils.getMaxLen(elt.lines)));
        const result:Array<string>=[];
        this.forEach((elt,index)=>{
            elt.width=maxWidth;
            const lines=elt.lines;
            if (index!=0) lines.shift();
            result.push(...lines);
        });
        return result;
    }
}

