# Changelog

All notable product-facing changes for StudyTodAI are tracked here.

## [1.1.0] - 2026-03-22

Local release target that structures the changes made after the `v1.0.0` GitHub baseline.

### Added

- Project lifecycle controls: edit, favorite, archive, restore, and permanent delete safeguards.
- Project summaries with document totals, ready counts, and processing counts.
- Workspace-level project switching and inline project editing without leaving the current workspace.
- Shared localized error messages plus stronger ES/EN dictionary coverage for dashboard, workspace, navigation, and not-found states.
- `lint:i18n` script to catch hard-coded literals and protect localization coverage.

### Changed

- Dashboard UX now behaves as a project hub with search, sorting, favorites filtering, archived views, and mobile-aware editing.
- Project API now supports `PATCH` and `DELETE`, including validation for editable project fields and safe delete rules.
- Data-store project queries now normalize favorites and archive state, support status filters, and return richer list items for UI summaries.
- Workspace interactions now refresh project context after uploads and chat activity, improving cross-project navigation and recency tracking.

### Fixed

- Error handling now maps backend failures to localized user-facing messages more consistently.
- Project selection and preview state are reset more safely when navigating between workspaces.
- Permanent deletion now removes related documents, chats, messages, processing jobs, chunks, and stored assets in cascade.

## [1.0.0]

Initial GitHub baseline release.

### Included

- Bilingual `ES/EN` routing with landing, login, dashboard, and workspace flows.
- Project creation plus a three-pane workspace for documents, preview, and AI chat.
- Async document processing states with local demo persistence and cloud-ready integrations.
- Citation-aware project chat over uploaded study materials.
