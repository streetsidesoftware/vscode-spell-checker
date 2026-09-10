(function () {
    var base = '/vscode-spell-checker/';
    if (window.location.pathname !== base) return;
    var hash = window.location.hash;
    if (!hash || hash.length < 2) return;
    // Anchors that belong to the new landing page, if any are added later.
    var keep = [];
    if (keep.indexOf(hash) !== -1) return;
    // Anchors that now have a page of their own; everything else falls through to Reference.
    var pages = {
        '#in-document-settings': 'docs/guides/in-document-settings',
        '#enable--disable-file-types': 'docs/guides/enable-file-types',
        '#enabled-file-types': 'docs/guides/enable-file-types',
    };
    var target = pages[hash.toLowerCase()];
    window.location.replace(target ? base + target : base + 'docs/reference' + hash);
})();
