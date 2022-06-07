import { SymbolKind, Range } from './extHostTypes';
import { TypeHierarchyItem } from './TypeHierarchyItem';
import { Uri } from './uri';

describe('TypeHierarchyItem', () => {
    test('TypeHierarchyItem', () => {
        expect(typeof TypeHierarchyItem).toBe('function');
    });
    test('create TypeHierarchyItem', () => {
        const item = new TypeHierarchyItem(
            SymbolKind.File,
            'item',
            'detail',
            Uri.file(__filename),
            new Range(0, 0, 0, 0),
            new Range(0, 0, 0, 0)
        );

        expect(item).toBeInstanceOf(TypeHierarchyItem);
    });
});
