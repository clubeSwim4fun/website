import type { GlobalAfterChangeHook } from 'payload'

import { revalidateTag } from 'next/cache'

export const revalidateConfigs: GlobalAfterChangeHook = ({
  doc,
  req: { payload, context, locale },
}) => {
  if (!context.disableRevalidate) {
    payload.logger.info(`Revalidating general configs`)

    revalidateTag(`global_generalConfigs_${locale}`)
  }

  return doc
}
