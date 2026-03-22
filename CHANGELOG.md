# Changelog

All notable product-facing changes for StudyTodAI are tracked here.

## [1.1.2] - 2026-03-22

Landing and access release focused on making the first visit clearer, more guided, and more consistent across languages and devices.

### Added

- A fully expanded landing page that now shows the actual study flow with product mockups, use cases, trust labels, and a clearer explanation of how the workspace works.
- A dedicated register action in the public header, plus direct access to the sign-up tab from `?mode=signup`.
- New ES/EN marketing copy for the landing experience, including feature highlights, workflow steps, use cases, and proof points.

### Changed

- Signed-in users are now redirected away from the public home and login pages straight into their project hub.
- The public navigation now adapts to the landing route, showing login and register actions before authentication instead of dashboard-only links.
- The language switcher now preserves query parameters, so changing language no longer drops the selected auth mode or similar public-page state.

### Fixed

- Landing typography now reads more comfortably thanks to stronger contrast, softer tracking in labels, and improved global text rendering.
- The auth card can now open directly in sign-up mode without forcing users to manually switch tabs after navigating from the header.
- The landing layout now explains the three-pane workspace more clearly on mobile with focused mockups instead of leaving the responsive behavior implicit.

## [1.1.1] - 2026-03-22

Refinement release focused on making the project hub clearer to navigate, easier to start from zero, and more accessible across the app.

### Added

- First-project onboarding copy with a suggested starter project flow when the dashboard is still empty.
- Inline success feedback after creating a project, so users get immediate confirmation without leaving the hub.
- Expanded ES/EN copy for welcome states, filtered-empty states, and guided project creation prompts.

### Changed

- The dashboard layout now prioritizes one clear create-project action, compact summary cards, and filter pills that are easier to scan and use.
- Project editing now opens in a dedicated panel instead of relying on the previous mobile-only editor behavior.
- The landing, login, workspace, and project switcher surfaces now share more consistent typography and visual labels.

### Fixed

- Keyboard focus is now much easier to see across links, buttons, inputs, and selectors.
- Busy states during project saves now provide clearer feedback, including a loading spinner on the submit action.
- Decorative icons and heading markup were adjusted to improve accessibility on key public and workspace views.

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
