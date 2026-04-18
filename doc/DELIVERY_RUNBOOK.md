# Delivery Runbook

## Execution Order

1. Inspect the repository and runtime state
2. Finalize product and implementation documents
3. Implement the site, pages, and product features
4. Run local verification and browser testing
5. Push to GitHub
6. Deploy to Vercel
7. Bind custom domain
8. Configure Cloudflare orange-cloud proxy
9. Run post-deploy checks

## Implementation Expectations

### Pages

- landing page
- workspace page
- public shared document page
- fallback / error states where needed

### Functional Expectations

- robust Markdown rendering pipeline
- attractive presentation for content
- stable support for diagrams and math
- export and sharing
- responsive experience on desktop and mobile

## Verification Checklist

### Before Push

- lint passes
- build passes
- local run succeeds
- browser checks pass
- no critical console errors

### Before Production

- preview deployment loads
- core flows pass on Vercel preview
- metadata and social preview are correct
- domain records are correct

### After Production

- production domain resolves
- site loads over HTTPS
- Cloudflare proxy is enabled
- orange-cloud path still serves valid Vercel traffic

## GitHub Push Expectations

- clean commit set
- no unrelated file reverts
- documentation updated with real outcomes

## Vercel Expectations

- project linked to team `10kmrr`
- production deployment successful
- custom domain attached and verified

## Cloudflare Expectations

- DNS points to Vercel as required
- orange cloud enabled only after routing is healthy
- post-change verification completed

## Documentation Maintenance

Update these docs during execution:

- `BLOCKERS.md` whenever an environment issue changes scope or timing
- `TASK_BREAKDOWN.md` when tasks move from planned to done
- `README.md` if deployment targets or process assumptions change

## Failure Policy

If any step fails:

- document the exact blocker
- continue with non-blocked work where possible
- retry only after the blocker is understood
