import { createTextDocument } from '../vscodeTypesHelper';
import { MockTextEditor } from './TextEditor';
import { Uri } from './uri';

describe('TextEditor', () => {
    test('MockTextEditor', () => {
        const doc = createTextDocument(Uri.file(__filename), sampleContent());
        const te = new MockTextEditor(doc);
        expect(te.document).toBe(doc);
        expect(te.selection).toBeDefined();
        expect(te.selections).toHaveLength(1);

        expect(te.visibleRanges).toBeDefined();
        expect(te.viewColumn).toBeUndefined();

        const options = { tabSize: 4 };
        te.options = options;
        expect(te.options).toEqual(options);
    });
});

function sampleContent() {
    return `Line 1
Line 2
Line 3
`;
}
