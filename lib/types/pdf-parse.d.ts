declare module 'pdf-parse' {
  interface PDFParseResult {
    text: string;
    numpages: number;
    info: any;
    metadata: any;
    version: string;
  }

  function parse(dataBuffer: Buffer): Promise<PDFParseResult>;
  export default parse;
} 