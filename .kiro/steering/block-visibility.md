---
inclusion: manual
---

# Block Visibility

Content blocks on CMS pages can be restricted per audience. Check runs server-side — hidden blocks are never rendered.

## Visibility Options

| Option                    | Who Sees It                                  |
| ------------------------- | -------------------------------------------- |
| Everyone (default)        | All visitors                                 |
| Logged In Only            | Any authenticated user                       |
| Not Logged In             | Unauthenticated only                         |
| Active Members Only       | `user.status === 'active'`                   |
| Admins Only               | `user.role === 'admin'`                      |
| Specific Groups/Subgroups | User in any of the selected groups/subgroups |

## Key Files

| File                                   | Purpose                                                                   |
| -------------------------------------- | ------------------------------------------------------------------------- |
| `src/fields/blockVisibilityDynamic.ts` | Field definition (`visibilityType` select + `allowedGroups` relationship) |
| `src/helpers/blockVisibilityHelper.ts` | `shouldShowBlock()` — all logic here                                      |
| `src/blocks/RenderBlocks.tsx`          | Calls `shouldShowBlock()` per block; accepts `user` prop                  |

## Data Shape (important)

`blockVisibility.allowedGroups` and `user.groups` are polymorphic arrays:

```ts
{ relationTo: 'groups' | 'group-categories', value: string | PopulatedObject }
```

Extract IDs via `entry.value` (string) or `entry.value.id` (populated). Flat ID comparison silently fails.

## Adding to a New Block

```ts
import { blockVisibilityDynamicField } from '@/fields/blockVisibilityDynamic'

export const MyBlock: Block = {
  slug: 'myBlock',
  fields: [blockVisibilityDynamicField, /* always first */ ...],
}
```

## Notes

- Specific groups: user needs to match **any one** selected group/subgroup
- `allowedGroups` field only appears in admin when `visibilityType === 'specificGroups'`
- Form Block: `form` relationship is not required — no form = renders nothing
