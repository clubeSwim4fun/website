import { GeneralConfig, Group, GroupCategory } from '@/payload-types'
import { ImageMedia } from '../Media/ImageMedia'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { getLocale } from 'next-intl/server'
import { TypedLocale } from 'payload'

type Args = {
  groups?: (string | Group | GroupCategory)[]
  compact?: boolean
}

export const UserGroups: React.FC<Args> = async (props) => {
  const { groups, compact } = props
  const locale = (await getLocale()) as TypedLocale
  const generalConfigs = (await getCachedGlobal('generalConfigs', 1, locale)()) as GeneralConfig

  const showBadges =
    !compact && (generalConfigs.settings?.fixedPages?.myProfile?.useBadges || false)

  if (compact) {
    return (
      <>
        {groups?.map((group) => (
          <span
            key={typeof group === 'object' ? group.id : group}
            className="text-[11px] font-semibold px-[10px] py-[3px] rounded-full tracking-[.4px] text-white"
            style={{ background: 'rgba(255,255,255,.15)' }}
          >
            {typeof group === 'object' ? group.title : group}
          </span>
        ))}
      </>
    )
  }

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
