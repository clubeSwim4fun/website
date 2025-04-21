import { GeneralConfig, Group, GroupCategory } from '@/payload-types'
import { ImageMedia } from '../Media/ImageMedia'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { getLocale } from 'next-intl/server'
import { TypedLocale } from 'payload'

type Args = {
  groups?: (string | Group | GroupCategory)[]
}

export const UserGroups: React.FC<Args> = async (props) => {
  const { groups } = props
  const locale = (await getLocale()) as TypedLocale
  const generalConfigs = (await getCachedGlobal('generalConfigs', 1, locale)()) as GeneralConfig

  const showBadges = generalConfigs.settings?.fixedPages?.myProfile?.useBadges || false

  return (
    <div className="grid grid-cols-6 mt-4">
      {groups?.map((group) => (
        <div
          className="col-span-2 flex flex-col items-center justify-start"
          key={typeof group === 'object' ? group.id : group}
        >
          {showBadges && typeof group === 'object' && group.badge && (
            <ImageMedia imgClassName="h-20 w-20" resource={group.badge} />
          )}
          <span className="font-bold text-sm text-center">
            {typeof group === 'object' ? group.title : group}
          </span>
        </div>
      ))}
    </div>
  )
}
