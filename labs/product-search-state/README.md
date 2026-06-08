# Product Search State Lab

This lab turns chapter 15's product-search case study into executable TypeScript contracts.

It focuses on the mistakes AI-generated frontend code often makes:

- duplicating URL state in local component state
- leaving empty query parameters in the URL
- forgetting to reset `page` when filters change
- using incomplete server-state query keys
- storing derived values instead of computing them
- failing to rollback optimistic favorite updates

## Run

```bash
npm install
npm test
```

In this vault, the test can also be built with the existing local TypeScript compiler used by the other lab:

```bash
../../../prompt-harness/labs/contract-harness/node_modules/.bin/tsc -p tsconfig.json
node --test test/*.test.mjs
```
