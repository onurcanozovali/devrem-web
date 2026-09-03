# Devrem Web — Codex Working Rules

This file defines the default working rules for Codex in this repository.

Follow these rules unless the user's current task explicitly overrides them.

---

## 1. Core Working Style

Keep every task tightly scoped.

Do not perform broad audits unless explicitly requested.

Do not inspect or modify unrelated areas of the repository.

Do not refactor working code merely because another implementation looks cleaner.

Prefer the smallest correct change that satisfies the task.

Reuse existing:

- components
- utilities
- services
- data models
- design patterns
- admin architecture
- SEO architecture

before introducing new abstractions.

Do not rebuild working systems.

---

## 2. Token / Context Efficiency

Be economical with repository exploration.

Before reading many files:

1. identify the likely relevant files
2. search for the relevant symbol/route/component
3. inspect only those files and their direct dependencies

Do not read the entire repository for a localized task.

Avoid inspecting:

- node_modules
- generated build output
- large lockfiles unless dependency work requires it
- cached files
- build artifacts
- unrelated test suites
- unrelated routes

Do not repeatedly reopen files whose relevant contents are already known.

Do not generate long implementation plans before routine coding tasks.

For normal scoped tasks:

inspect → implement → validate → finish.

---

## 3. Do Not Narrate Routine Work

Do not produce a running implementation diary.

Avoid messages such as:

- "Now I am checking..."
- "Next I will inspect..."
- "I am continuing with..."
- "Now I will validate..."

Work silently unless:

- a blocker requires user input
- there is a significant safety concern
- the task is genuinely ambiguous

Otherwise only provide the final result.

---

## 4. Final Responses

Keep final responses concise.

Default maximum:

8 short bullets.

Report only material information such as:

- what changed
- important architecture decisions
- unavailable/not-connected functionality
- validation result
- required manual action

Do not repeat the original task.

Do not list every modified file unless specifically requested.

Do not produce a long audit report unless explicitly requested.

---

## 5. Scope Protection

Do not modify unrelated working features.

A task concerning:

- Blog → do not redesign Landing
- Admin → do not redesign public website
- SEO → do not rewrite editorial content unnecessarily
- Dashboard → do not redesign sidebar unless requested
- Bedelli → do not change unrelated tools
- Web → never modify the Expo/mobile repository

Do not introduce unrelated cleanup changes into the same task.

---

## 6. Repository Boundary

This repository is the Devrem WEB project.

Do not modify the separate Devrem React Native / Expo mobile repository from a web task.

If mobile source code is inspected for reference:

treat it as read-only unless the user explicitly requested a mobile change.

---

## 7. Existing Architecture First

Before creating:

- a new database
- another CMS
- another authentication system
- another analytics system
- another design system
- another state framework
- another SEO framework

check whether the existing project already provides the required capability.

Prefer extending the current architecture.

Do not introduce a large dependency for a small feature when a lightweight implementation is sufficient.

---

## 8. UI / Design Changes

Preserve the existing Devrem design language.

Do not turn the website into:

- generic SaaS UI
- card walls
- finance dashboards
- military camouflage-themed interfaces
- overly corporate layouts

Prefer:

- strong hierarchy
- meaningful typography
- varied content structures
- whitespace
- Devrem brand styling
- mobile-friendly layouts

Do not redesign unrelated pages during a localized UI task.

---

## 9. Browser QA

Use browser / screenshot QA only when the task materially changes UI or responsive behavior.

For visual changes, test only the breakpoints necessary to catch likely problems.

Default useful targets:

- desktop
- one representative mobile width

Add additional widths only if the implementation is responsive-sensitive.

Do not repeatedly test:

390
430
768
1024
1440
1920

for every minor UI change.

If an earlier browser check passed and no relevant UI code changed afterward, do not repeat it.

---

## 10. Testing Strategy

Use targeted validation during implementation.

Run the full relevant validation only once at the end.

Default:

- relevant tests
- typecheck
- lint

Run full production build when:

- routing changed
- SSR/server rendering changed
- metadata/SEO infrastructure changed
- dependencies/config changed
- release-readiness requires it
- user explicitly requested it

Do not repeatedly rerun successful checks unless code affecting them changed.

Do not run unrelated large test suites for a small isolated change.

---

## 11. Production Safety

Never mutate production data merely to test functionality.

Do not:

- create fake production users
- modify real users
- change real military data
- send production push notifications
- alter moderation states for testing
- seed fake analytics
- delete production records

Prefer:

- test fixtures
- mocks
- emulator/local environments
- read-only verification

Any destructive or externally visible production action requires explicit user intent.

---

## 12. Firebase / Admin Safety

The Admin SDK bypasses Firestore Security Rules.

Therefore every privileged server operation must enforce authorization server-side.

Never rely only on:

- hidden UI
- disabled buttons
- client-side role checks

Sensitive admin mutations should use the existing:

- authentication
- permission
- audit log

architecture.

Do not expose Firebase Admin credentials to browser code.

Do not expose private environment variables through client bundles.

---

## 13. Admin Behavior

Do not implement unrestricted private-message browsing.

Moderation may access only the minimum context necessary for a reported item.

Do not allow arbitrary movement of users between canonical Devre groups unless explicitly designed and authorized.

Admin actions such as:

- suspend
- ban
- content removal
- privilege changes

must preserve existing authorization and audit requirements.

Do not make UI controls appear functional if the mobile/backend does not actually consume them.

Mark such functionality clearly as not connected instead.

---

## 14. Fake Data Is Forbidden

Never fabricate production-facing:

- user counts
- ratings
- reviews
- testimonials
- sponsors
- partners
- analytics
- prices
- military information
- historical values
- conversion rates

If reliable data is unavailable:

show unavailable,
omit the feature,
or build the architecture without fake production values.

---

## 15. Military Information

Devrem is an independent platform.

Do not imply that Devrem is:

- an official MSB service
- an official TSK service
- government approved
- officially verified by MSB

unless such a statement becomes factually true and is explicitly supplied.

Keep verification distinctions for military unit data intact.

Do not convert unverified information into verified information silently.

---

## 16. SEO Architecture

The production canonical origin is:

https://devrem.co

Use the existing centralized SEO architecture.

Do not create competing metadata utilities.

Maintain:

- unique page titles
- meta descriptions
- canonical URLs
- Open Graph
- Twitter metadata
- index/noindex behavior
- structured data
- dynamic sitemap behavior

Do not use meta keywords.

Do not fabricate structured-data ratings or reviews.

---

## 17. Sitemap / Indexation

Sitemaps must contain only canonical, indexable, published public URLs.

Exclude:

- admin
- API
- drafts
- previews
- noindex content
- redirects
- missing pages

Use real content modification dates for lastmod.

Do not set every sitemap item's lastmod to the current request time.

Production indexing depends on the existing environment/configuration policy.

Do not weaken staging/preview noindex protection.

---

## 18. Blog / CMS

Preserve the existing CMS architecture.

Published blog metadata should continue to drive:

- SEO metadata
- sitemap
- Article structured data
- OG information

Draft/unpublished content must not accidentally become indexable.

If a published slug changes, preserve the existing redirect-history strategy.

Do not introduce broken public URLs.

---

## 19. Internal Links

Use real crawlable links.

Do not create known broken CTA destinations.

Before adding a CTA:

reuse an existing valid destination when possible.

Do not invent a future route and link to it unless the task also creates that route.

---

## 20. Performance

Do not make a simple page unnecessarily client-heavy.

Prefer server-rendered/server-component content where the existing architecture supports it.

Avoid introducing large JavaScript dependencies for simple visual behavior.

Optimize obvious:

- oversized images
- layout shifts
- unnecessary client components
- excessive data fetching

without turning every feature task into a site-wide performance audit.

---

## 21. Data Fetching

Avoid:

- unbounded reads
- N+1 queries
- downloading full collections into the browser
- realtime listeners for analytics dashboards
- repeated identical fetches

Use existing:

- pagination
- aggregates
- bounded queries
- caching
- server-side data access

where appropriate.

---

## 22. Comments and Documentation

Do not add comments that merely restate the code.

Comment only when explaining:

- non-obvious constraints
- security reasoning
- compatibility behavior
- migration semantics

Do not create new documentation files unless the task requires them.

---

## 23. Dependency Changes

Do not add a dependency if the current stack can solve the problem cleanly.

If adding one is justified:

- prefer maintained lightweight packages
- avoid overlapping libraries
- update the correct lockfile
- do not perform unrelated dependency upgrades

---

## 24. Git

Do not perform broad unrelated commits.

Do not use destructive Git commands.

Do not discard user work.

Do not reset unrelated changes.

Commit/push only when explicitly requested or already established as part of the workflow.

---

## 25. Default Task Flow

For most tasks use this workflow:

1. Find the relevant implementation.
2. Read only the necessary files.
3. Implement the smallest correct change.
4. Add/update targeted tests if valuable.
5. Run relevant validation once.
6. Return a concise final result.

Do not add extra audit phases without a concrete reason.

---

## 26. When Extra Thoroughness IS Required

Be more conservative and thorough for:

- authentication
- authorization
- Firebase Security Rules
- admin permissions
- account deletion
- data migrations
- moderation enforcement
- production data mutations
- payment/security features
- canonical Devre membership logic
- destructive operations

For ordinary UI/content/SEO component work, prefer the efficient workflow.

---

## 27. User Preference

The project owner prefers:

- action over repeated audits
- low token/cost usage
- short final reports
- one-pass implementation
- production-safe changes
- no unnecessary confirmation loops

Optimize for finishing the requested task correctly in one focused pass.
