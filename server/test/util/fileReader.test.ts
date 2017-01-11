import { expect } from 'chai';
import * as fileReader from '../../src/util/fileReader';

describe('Validate file reader', () => {
    it('Catches errors for non-existent files', () => {
        return fileReader.textFileStream('./non-existent.txt')
            .toPromise()
            .then(
                ok => {
                    expect(true).to.be.false;
                },
                error => {
                    expect(error).to.be.instanceof(Error);
                    return true;  // convert the error into a success.
                }
            );
    });
});