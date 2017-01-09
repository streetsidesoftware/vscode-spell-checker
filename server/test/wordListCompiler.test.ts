
import { expect } from 'chai';
import * as Rx from 'rx';
import { lineToWords } from '../src/wordListCompiler';

describe('Validate the wordListCompiler', function() {
    it('tests splitting lines', () => {
        const line = 'AppendIterator::getArrayIterator';
        expect(lineToWords(line).toArray()).to.deep.equal([
            'appenditerator',
            'append',
            'iterator',
            'getarrayiterator',
            'get',
            'array',
        ]);
        expect(lineToWords('Austin Martin').toArray()).to.deep.equal([
            'austin martin', 'austin', 'martin'
        ]);
    });
});

const phpLines = `
    apd_get_active_symbols
    apd_set_pprof_trace
    apd_set_session
    apd_set_session_trace
    apd_set_session_trace_socket
    AppendIterator::append
    AppendIterator::current
    AppendIterator::getArrayIterator
    AppendIterator::getInnerIterator
    AppendIterator::getIteratorIndex
    AppendIterator::key
`;