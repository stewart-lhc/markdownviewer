# Deployment And DNS Checklist

## GitHub

- inspect repository status
- review changed files
- commit with intentional message
- push to remote branch

## Vercel

- confirm target team is `10kmrr`
- create or link project
- configure production build settings
- deploy preview or production build
- verify deployment health

## Domain Binding

- add `markdownviewer.run`
- add `www.markdownviewer.run` if used
- confirm Vercel-provided DNS requirements
- confirm certificate issuance

## Cloudflare DNS

- create or update required DNS records
- validate DNS propagation
- enable orange-cloud proxy after Vercel is healthy
- verify proxied traffic still serves the deployment correctly

## Post-Deploy Verification

- open production domain
- verify HTTPS
- verify homepage input flow
- verify workspace flow
- verify shared page flow
- verify no blocking console errors

## Security Follow-Up

- rotate the Cloudflare token that was pasted into chat after configuration is complete
