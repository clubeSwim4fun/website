import type { GlobalAfterChangeHook } from 'payload'

import { revalidateTag } from 'next/cache'

export const revalidateConfigs: GlobalAfterChangeHook = ({ doc, req: { payload, context } }) => {
  if (!context.disableRevalidate) {
    payload.logger.info(`Revalidating general configs`)

    revalidateTag(`global_generalConfigs_en`, 'default')
    revalidateTag(`global_generalConfigs_pt`, 'default')
  }

  return doc
}
