
import { expect } from 'chai';
import { lineToWords } from './wordListCompiler';

describe('Validate the wordListCompiler', function() {
    it('tests splitting lines', () => {
        const line = 'AppendIterator::getArrayIterator';
        expect(lineToWords(line).toArray()).to.deep.equal([
            'append',
            'iterator',
            'get',
            'array',
        ]);
        expect(lineToWords('Austin Martin').toArray()).to.deep.equal([
            'austin martin', 'austin', 'martin'
        ]);
        expect(lineToWords('JPEGsBLOBs').toArray()).to.deep.equal(['jpegs', 'blobs']);
        expect(lineToWords('CURLs CURLing').toArray()).to.deep.equal(['curls curling', 'curls', 'curling']);
        expect(lineToWords('DNSTable Lookup').toArray()).to.deep.equal(['dns', 'table', 'lookup']);
        expect(lineToWords('OUTRing').toArray()).to.deep.equal(['outring']);
        expect(lineToWords('OUTRings').toArray()).to.deep.equal(['outrings']);
        expect(lineToWords('DIRs').toArray()).to.deep.equal(['dirs']);
        expect(lineToWords('AVGAspect').toArray()).to.deep.equal(['avg', 'aspect']);
        expect(lineToWords('New York').toArray()).to.deep.equal(['new york', 'new', 'york']);
        expect(lineToWords('Namespace DNSLookup').toArray()).to.deep.equal(['namespace', 'dns', 'lookup']);
        expect(lineToWords('well-educated').toArray()).to.deep.equal(['well-educated', 'well', 'educated']);
        // Sadly we cannot do this one correctly
        expect(lineToWords('CURLcode').toArray()).to.deep.equal(['cur', 'lcode']);
        expect(lineToWords('kDNSServiceErr_BadSig').toArray()).to.deep.equal([
            'dns',
            'service',
            'err',
            'bad',
            'sig',
        ]);
        expect(lineToWords('apd_get_active_symbols').toArray()).to.deep.equal([
            'apd',
            'get',
            'active',
            'symbols',
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