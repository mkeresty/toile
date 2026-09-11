# Registry and installation

Toile follows the current shadcn GitHub registry convention. The root `registry.json` declares installable items and source targets. Consumers install a single item with:

```bash
pnpm dlx shadcn@latest add mkeresty/toile/button
```

Core items do not depend on artwork or scene orchestration. Illustrated blocks declare their motion and primitive dependencies. Published releases should pin same-repository dependencies to a tag or commit SHA for reproducible installs.
