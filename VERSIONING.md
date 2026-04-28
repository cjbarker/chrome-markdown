# Versioning Strategy

This extension follows [Semantic Versioning](https://semver.org/) (SemVer)
adapted to the [Chrome extension version
format](https://developer.chrome.com/docs/extensions/reference/manifest/version)
(one to four dot-separated integers, each `0`–`65535`).

## Version format

`MAJOR.MINOR[.PATCH]` in `manifest.json`'s `version` field.

| Bump  | When to use                                                                 |
| ----- | --------------------------------------------------------------------------- |
| MAJOR | Breaking changes to stored data, removed permissions, or removed features.  |
| MINOR | New user-visible features (modes, themes, shortcuts, integrations).         |
| PATCH | Bug fixes, dependency bumps, copy edits, internal refactors with no UX impact. |

The optional `version_name` field carries a human-readable label (e.g.
`"1.0"`, `"1.1.0-beta"`) when we want a friendlier display in
`chrome://extensions` than the numeric `version`.

## Milestones

| Milestone | Meaning                                                                |
| --------- | ---------------------------------------------------------------------- |
| `0.x`     | Pre-release, breaking changes possible at any time.                    |
| `1.0`     | First stable release. Public API/UX is committed to.                   |
| `1.x`     | Backwards-compatible additions and fixes on top of `1.0`.              |
| `2.0+`    | Reserved for breaking changes (storage migrations, removed shortcuts). |

## Release procedure

1. Land all changes for the release on `main` via PRs.
2. Update `version` (and `version_name` if used) in
   [`manifest.json`](./manifest.json).
3. Add a new `## [x.y.z] - YYYY-MM-DD` section at the top of
   [`CHANGELOG.md`](./CHANGELOG.md) following
   [Keep a Changelog](https://keepachangelog.com/) categories
   (Added / Changed / Fixed / Removed / Security).
4. Commit with the message `Release vX.Y.Z`.
5. Tag the commit: `git tag -a vX.Y.Z -m "Release vX.Y.Z" && git push --tags`.
6. Create a GitHub Release from the tag, pasting the relevant CHANGELOG
   section into the release notes.

## Storage migrations

Stored keys live under `chrome.storage.local`:

- `md.content` — last editor draft
- `md.mode` — last layout mode (`edit` | `split` | `view`)
- `md.theme` — last theme (`light` | `dark`)

Any change that renames, removes, or changes the shape of a key requires:

- A **MAJOR** bump.
- A migration step in `editor.js` that reads old keys, writes new ones, and
  removes the legacy keys, gated on a stored `md.schemaVersion`.
- A note in the CHANGELOG under **Changed** or **Removed**.
