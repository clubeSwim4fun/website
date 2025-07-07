'use client'

import { GeneralConfig, User } from '@/payload-types'
import { cn } from '@/utilities/ui'
import { FormBlockClient } from '@/blocks/Form/Component.client'
import type { Form as FormType } from '@payloadcms/plugin-form-builder/types'
import { createGroupSubscription } from '@/actions/group-subscription'

const GroupSubscriptionPageClient = ({
  user,
  formConfig,
  globalConfig,
  groupSlug,
}: {
  user: User
  formConfig: FormType
  globalConfig: GeneralConfig
  groupSlug: string
}) => {
  const handleSubmit = async (
    formData: { [key: string]: any }[],
  ): Promise<{ error: string | undefined }> => {
    const response = await createGroupSubscription({
      data: formData,
      groupSlug,
    })

    sessionStorage.setItem('groupSubscriptionId', response.submissionId || '')

    return response
  }

  return (
    <section
      className={cn(
        'pt-[104px] pb-24 container max-w-5xl',
        `${user.status !== 'active' ? 'mx' : 'm'}-auto`,
      )}
    >
      <FormBlockClient
        enableIntro={false}
        form={formConfig}
        generalConfigData={globalConfig}
        onSubmit={handleSubmit}
      />
    </section>
  )
}

export default GroupSubscriptionPageClient
