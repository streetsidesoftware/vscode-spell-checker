(function () {
    var base = '/vscode-spell-checker/';
    if (window.location.pathname !== base) return;
    var hash = window.location.hash;
    if (!hash || hash.length < 2) return;
    // Anchors that belong to the new landing page, if any are added later.
    var keep = [];
    if (keep.indexOf(hash) !== -1) return;
    window.location.replace(base + 'docs/reference' + hash);
})();
