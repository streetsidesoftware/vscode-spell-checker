# Releasing

How the extension gets versioned and published to the VS Code Marketplace and Open VSX. Commit messages drive it, and
the workflows do the rest.

## Who reads the release notes

The changelog and the GitHub release notes are read by people who use the spell checker. Only `feat:`, `fix:`,
`perf:`, and `revert:` commits show up in them, so write those commit subjects and PR titles for that reader. See
[`CONTRIBUTING.md`](../CONTRIBUTING.md#commit-messages) for the commit types.

## The flow

### 1. Release Please keeps a release PR open

On every push to `main`, `.github/workflows/release-please.yml` updates a PR titled
`chore(main): release code-spell-checker X.Y.Z`.

- It bumps the version in `package.json` and adds a `CHANGELOG.md` entry, based on the commits since the last release.
- `release-please-config.json` maps commit types to changelog sections, and hides the types users don't need to see.
- `.release-please-manifest.json` records the last released version.
- The PR gets a `Release` or `Prerelease` label to match the current prerelease mode.

### 2. Merging the release PR publishes

When the release PR merges, `release-please.yml`:

- creates the GitHub release and pushes the `vX.Y.Z` tag,
- runs `release-assets.yml`, which builds the `.vsix` and attaches it to the release,
- runs `release-mark-prerelease.yml`, which marks the GitHub release as a prerelease when prerelease mode is on,
- runs `release-notes.yml`, which adds a table with the extension, VS Code engine, and CSpell versions to the release
  notes,
- runs `manual-publish.yml`, which builds the `.vsix` and publishes it with `vsce` and `ovsx`.

Publishing is skipped when the version isn't a plain `X.Y.Z`.

## Prerelease mode

The extension can be published as a Marketplace pre-release.

- The mode is `"vsce": { "preRelease": true }` in the root `package.json`. `vsce` reads that field, so every `.vsix`
  built in this mode is marked as a pre-release.
- Change it only with the **Set Prerelease** workflow (`set-prerelease.yml`). It opens a PR from the
  `update-prerelease-mode` branch.
    - Turning prerelease mode on opens `chore: Set Prerelease Mode to true`. A `chore:` commit doesn't start a release.
    - Turning it off opens `fix: Prepare for Release`. The `fix:` type is on purpose: it makes Release Please open a
      release PR, so the next release is a regular one even when nothing else has changed.

## Forcing a release

Release Please opens a release PR only for commits that would show up in the changelog: types that aren't `hidden` in
`release-please-config.json` (`feat:`, `fix:`, `perf:`, `revert:`). A hidden type (`chore:`, `refactor:`, `docs:`, …)
doesn't start one.

To release anyway, merge a `fix:` commit. The `fix: Prepare for Release` PR described above is how that is done.

## CSpell updates

The extension does its spell checking with cspell, so a new cspell version or dictionary bundle changes what users see.

- `update-cspell.yml` opens `fix: Update CSpell from … to …` PRs.
- They stay `fix:` on purpose, so each one is listed in the release notes and starts a release.
- This is the only kind of dependency update that belongs in the release notes. Other dependency updates are `chore:`
  or `ci:`.

## Publishing by hand

`manual-publish.yml` can also be run from the Actions tab with a release tag, for example `v4.9.3`. It uses the
`VSCE_TOKEN` and `OVSX_TOKEN` repository secrets. Use it to retry a publish that failed.

## Fixing a changelog entry after merge

If a PR merged with the wrong type, correct it on the merged PR, never on the release PR, which is regenerated on every
run. Add a block like this to the end of the merged PR's description:

```text
BEGIN_COMMIT_OVERRIDE
chore: corrected commit message
END_COMMIT_OVERRIDE
```

Release Please uses it instead of the commit message the next time it runs. It works only for squash-merged PRs.
