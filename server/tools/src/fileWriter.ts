
import * as fs from 'fs';
import * as zlib from 'zlib';
import * as stream from 'stream';

export function writeToFile(filename: string, data: string) {
    const buffer = Buffer.from(data);
    const bufferStream = new stream.PassThrough();
    bufferStream.end( buffer);
    const zip = filename.match(/\.gz$/) ? zlib.createGzip() : new stream.PassThrough();
    return bufferStream.pipe(zip).pipe(fs.createWriteStream(filename));
}


