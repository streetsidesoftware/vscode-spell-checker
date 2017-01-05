import * as TextRange from '../../src/util/TextRange';
import { expect } from 'chai';

describe('Util Text', () => {

    it('tests unionRanges', () => {
        const result1 = TextRange.unionRanges([]);
        expect(result1).to.deep.equal([]);
        const result2 = TextRange.unionRanges([{startPos: 0, endPos: 10}]);
        expect(result2).to.deep.equal([{startPos: 0, endPos: 10}]);
        const result3 = TextRange.unionRanges([{startPos: 0, endPos: 10}, {startPos: 0, endPos: 10}]);
        expect(result3).to.deep.equal([{startPos: 0, endPos: 10}]);
        const result4 = TextRange.unionRanges([{startPos: 5, endPos: 15}, {startPos: 0, endPos: 10}]);
        expect(result4).to.deep.equal([{startPos: 0, endPos: 15}]);
        const result5 = TextRange.unionRanges([{startPos: 11, endPos: 15}, {startPos: 0, endPos: 10}]);
        expect(result5).to.deep.equal([{startPos: 0, endPos: 10}, {startPos: 11, endPos: 15}]);
        const result6 = TextRange.unionRanges([{startPos: 10, endPos: 15}, {startPos: 0, endPos: 10}]);
        expect(result6).to.deep.equal([{startPos: 0, endPos: 15}]);
    });


});

