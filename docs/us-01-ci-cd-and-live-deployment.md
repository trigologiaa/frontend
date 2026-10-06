# US-01 — Continuous integration and live deployment

**As a** developer, **I want** every pull request to be verified by a pipeline and every merge to
`main` to be published automatically, **so that** the site is live and working from the very first
story and each new user story reaches production in small, safe steps.

This is a technical (enabler) story. Its critical point is the **walking skeleton**: the smallest
possible app (only its heading) is already deployed at a public URL before any feature exists, so
deployment problems are found now, when they are cheap.

Requirement: Pre-delivery **Requirement 5** (online hosting) starts here; it is closed in
[US-16](us-16-pre-delivery-handoff.md).

## Scope

Included:

- A GitHub Actions workflow that runs `pnpm verify` on every pull request and on every push to
  `main`.
- Branch protection on `main`: pull request required, the `verify` check must pass, no direct
  pushes, no force pushes.
- A pull request template.
- A Vercel project connected to the repository: production deploy from `main`, a preview URL for
  every pull request.
- A deployment badge/link in the README (placeholder README, completed in US-16).

Not included:

- End-to-end tests in the pipeline: **US-15**.
- Custom domain, analytics, monitoring.
- SPA fallback for deep links (`vercel.json`): it needs real routes, so it arrives with **US-02**.

## Acceptance scenarios

These scenarios describe the pipeline; they are verified by actually triggering it (the guide shows
how). There is no Vitest test: the workflow file is configuration.

```gherkin
Feature: Continuous integration and live deployment
  As a developer
  I want every pull request verified and every merge published
  So that the site is always live and each story reaches production safely

  Scenario: A pull request runs the verification
    Given a branch with a commit
    When I open a pull request against "main"
    Then the "verify" check runs on GitHub

  Scenario: A red pull request cannot be merged
    Given a pull request whose "verify" check fails
    Then the merge button is blocked

  Scenario: A green pull request can be merged
    Given a pull request whose "verify" check passes
    Then I can merge it

  Scenario: Direct pushes to main are rejected
    When I push a commit directly to "main"
    Then GitHub rejects the push

  Scenario: Every pull request gets a preview
    When I open a pull request
    Then Vercel comments with a preview URL that shows the app

  Scenario: Merging publishes to production
    When I merge a pull request into "main"
    Then the production URL shows the change within a few minutes

  Scenario: The live page is working
    When I open the production URL
    Then I see the heading "Trigologia Dev"
```

## Non-functional requirements

- **Same command locally and remotely:** the workflow only calls `pnpm verify`; no check exists
  that you cannot run on your machine.
- **Least privilege:** the workflow declares `permissions: contents: read`.
- **Cheap and quick:** dependency cache enabled; obsolete runs of the same branch are cancelled
  (`concurrency`).
- **No secrets:** nothing in this story needs a secret in the repository.

## Decisions

- **Vercel with its Git integration** (not a deploy step in Actions): it is the simplest option (no
  tokens, previews for free) and it is what the course shows. Safety comes from branch protection:
  only a pull request whose `verify` passed can reach `main`, so what Vercel builds from `main` is
  already verified.
- **One required check named `verify`:** a single job makes the branch protection rule trivial.
- **Trunk-based flow with short-lived branches:** one branch per user story
  (`us-NN-short-name`), one pull request per story, squash merge so `main` keeps one Conventional
  Commit per story.
- **Solo repository:** approvals are not required (you cannot approve your own PR), but the
  pull-request rule and the green check are.

## Definition of Done

- [ ] A pull request of this story ran `verify` on GitHub and passed.
- [ ] A deliberately broken pull request was blocked (then closed).
- [ ] `main` is protected as described.
- [ ] The production URL shows the heading; a PR preview was seen.
- [ ] The README contains the production URL.
- [ ] Commits follow Conventional Commits.
