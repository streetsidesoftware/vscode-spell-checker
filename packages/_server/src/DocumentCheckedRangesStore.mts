type RANGES = readonly Readonly<[number, number]>[];

export class DocumentCheckedRangesStore {
    private rangesMap: Map<string, RANGES> = new Map();

    get(uri: string): RANGES | undefined {
        return this.rangesMap.get(uri);
    }

    set(uri: string, ranges: RANGES): void {
        this.rangesMap.set(uri, ranges);
    }

    clear(uri?: string): void {
        if (uri) {
            this.rangesMap.delete(uri);
        } else {
            this.rangesMap.clear();
        }
    }

    dispose() {
        this.clear();
    }
}
