---
inclusion: manual
---

# Block Visibility Feature

## Overview

Content blocks on CMS pages can be restricted to specific audiences. Admins configure visibility per block in the admin panel. The check runs server-side — hidden blocks are never rendered.

## Visibility Options

| Option                        | Who Sees It                                             |
| ----------------------------- | ------------------------------------------------------- |
| **Everyone** (default)        | All visitors                                            |
| **Logged In Users Only**      | Any authenticated user                                  |
| **Not Logged In**             | Unauthenticated visitors only                           |
| **Active Members Only**       | Users with `status: 'active'`                           |
| **Admins Only**               | Users with `role: 'admin'`                              |
| **Specific Groups/Subgroups** | Users belonging to any of the selected groups/subgroups |

## Key Files

| File                                          | Purpose                                                                                      |
| --------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `src/fields/blockVisibilityDynamic.ts`        | Payload field definition (group with `visibilityType` select + `allowedGroups` relationship) |
| `src/helpers/blockVisibilityHelper.ts`        | `shouldShowBlock()` — all visibility logic lives here                                        |
| `src/blocks/RenderBlocks.tsx`                 | Calls `shouldShowBlock()` per block before rendering; accepts `user` prop                    |
| `src/app/(frontend)/[locale]/[slug]/page.tsx` | Passes current user to `RenderBlocks`                                                        |

## Data Shape (important)

Both `blockVisibility.allowedGroups` and `user.groups` are **polymorphic relationship arrays**:

```ts
{ relationTo: 'groups' | 'group-categories', value: string | PopulatedObject }
```

The helper extracts IDs via `entry.value` (string ID or `entry.value.id` when populated). This is why a flat ID comparison would silently fail.

## Adding Visibility to a New Block

```typescript
import { blockVisibilityDynamicField } from '@/fields/blockVisibilityDynamic'

export const MyBlock: Block = {
  slug: 'myBlock',
  fields: [
    blockVisibilityDynamicField, // always first
    // ...
  ],
}
```

## Specific Groups Logic

- Multi-select — user needs to be in **any one** of the selected groups/subgroups
- Groups and subgroups are fetched live from the DB; new ones appear automatically
- The `allowedGroups` field only appears in the admin when `visibilityType === 'specificGroups'`

## Form Block Note

The `form` relationship field is **not required** — a Form Block with no form selected renders nothing. This allows visibility-restricted Form Blocks to be saved without a form.
