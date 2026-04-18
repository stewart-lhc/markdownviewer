# markdownviewer.run Docs

This directory tracks the end-to-end delivery of `markdownviewer.run`.

## Documents

- `PRD.md`
  Product requirements, scope, target users, and success criteria.
- `TASK_BREAKDOWN.md`
  Delivery tasks grouped by product, design, engineering, QA, deployment, and DNS.
- `DELIVERY_RUNBOOK.md`
  Execution order for implementation, verification, GitHub push, Vercel deployment, and Cloudflare DNS.
- `PAGES_AND_IA.md`
  Route map and page-level information architecture.
- `COMPONENT_SPEC.md`
  Component responsibilities and expected states.
- `TEST_PLAN.md`
  Functional, responsive, performance, and release-gate verification coverage.
- `DEPLOYMENT_AND_DNS_CHECKLIST.md`
  Ordered checklist for GitHub, Vercel, domain binding, Cloudflare, and post-deploy checks.
- `BLOCKERS.md`
  Active environment and execution blockers that affect local development or release operations.

## Current Goal

Deliver a production-ready Markdown viewer website that is visibly stronger than the referenced competitor in:

- opening Markdown from multiple sources
- reading and presentation quality
- sharing and publishing workflows
- stability for large documents and exports

## Confirmed Deployment Targets

- GitHub: current repository remote and current working branch unless repository state forces an adjustment
- Vercel team: `10kmrr`
- production domain: `markdownviewer.run`
- DNS provider: Cloudflare
- Cloudflare proxy: enabled after Vercel domain binding is healthy

## Delivery Principle

The work is documented first, then implemented, then verified, then deployed.
