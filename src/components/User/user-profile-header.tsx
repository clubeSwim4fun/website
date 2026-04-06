import { User, GeneralConfig, Media } from '@/payload-types'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getTranslations } from 'next-intl/server'
import { UserGroups } from './user-groups'
import { UserUpdateForm } from './user-update-form'
import { getClientSideURL } from '@/utilities/getURL'
import defaultAvatar from 'public/static-images/default-avatar.png'

type Props = {
  user: User
  globalConfig: GeneralConfig
  eventCount: number
  subscriptionCount: number
  poolSubCount?: number
}

export const UserProfileHeader: React.FC<Props> = async ({
  user,
  globalConfig,
  eventCount,
  subscriptionCount,
  poolSubCount = 0,
}) => {
  const t = await getTranslations()
  const userGroups = user.groups?.map((g) => g.value)

  const defaultAvatarMedia = globalConfig.settings?.fixedPages?.myProfile?.avatar as Media
  const profilePictureUrl = `${getClientSideURL()}/${
    typeof user.profilePicture === 'object'
      ? user.profilePicture?.url
      : defaultAvatarMedia?.thumbnailURL
  }`

  const initials = user.name.charAt(0) + user.surname.charAt(0)

  return (
    <div
      className="rounded-[14px] text-white overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0a4a6e 0%, #0e7ea8 100%)' }}
    >
      {/* ── Desktop layout ── */}
      <div
        className="hidden sm:grid p-7 gap-6 items-center"
        style={{ gridTemplateColumns: 'auto 1fr auto' }}
      >
        {/* Avatar */}
        <Avatar
          className="w-[72px] h-[72px] shrink-0 rounded-full border-2"
          style={{ background: 'rgba(255,255,255,.2)', borderColor: 'rgba(255,255,255,.4)' }}
        >
          <AvatarImage src={profilePictureUrl || defaultAvatar.src} />
          <AvatarFallback
            className="text-[22px] font-extrabold text-white"
            style={{ background: 'rgba(255,255,255,.2)' }}
          >
            {initials.toUpperCase()}
          </AvatarFallback>
        </Avatar>

        {/* Name / email / tags */}
        <div>
          <div className="text-[24px] font-extrabold leading-tight mb-1 uppercase tracking-wide">
            {user.name} {user.surname}
          </div>
          <div className="text-[13px] mb-3" style={{ opacity: 0.75 }}>
            {user.email}
          </div>
          <div className="flex flex-wrap gap-2">
            <span
              className="text-[11px] font-semibold px-[10px] py-[3px] rounded-full tracking-[.4px]"
              style={{ background: 'rgba(255,255,255,.15)' }}
            >
              {t('User.Profile.associateId', { id: user.associateId || 0 })}
            </span>
            {user.federationId && (
              <span
                className="text-[11px] font-semibold px-[10px] py-[3px] rounded-full tracking-[.4px]"
                style={{ background: 'rgba(255,255,255,.15)' }}
              >
                {t('User.Profile.federationId', { id: user.federationId })}
              </span>
            )}
            {userGroups && userGroups.length > 0 && <UserGroups groups={userGroups} compact />}
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-5 text-right shrink-0">
          <div>
            <div className="text-[22px] font-extrabold leading-none">{eventCount}</div>
            <div className="text-[11px] mt-0.5" style={{ opacity: 0.65 }}>
              {t('User.Events.title')}
            </div>
          </div>
          <div>
            <div className="text-[22px] font-extrabold leading-none">{subscriptionCount}</div>
            <div className="text-[11px] mt-0.5" style={{ opacity: 0.65 }}>
              {t('User.Subscriptions.title')}
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile layout ── */}
      <div className="sm:hidden">
        {/* Top row: avatar + name/email + edit */}
        <div className="flex items-center gap-3.5 px-5 pt-6 pb-0">
          <Avatar
            className="w-14 h-14 shrink-0 rounded-full border-2"
            style={{ background: 'rgba(255,255,255,.2)', borderColor: 'rgba(255,255,255,.35)' }}
          >
            <AvatarImage src={profilePictureUrl || defaultAvatar.src} />
            <AvatarFallback
              className="text-[18px] font-extrabold text-white"
              style={{ background: 'rgba(255,255,255,.2)' }}
            >
              {initials.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="text-[18px] font-extrabold leading-tight truncate">
              {user.name} {user.surname}
            </div>
            <div className="text-[12px] mt-0.5" style={{ opacity: 0.7 }}>
              {user.email}
            </div>
          </div>
          {/* Edit button in hero on mobile */}
          <UserUpdateForm user={user} />
        </div>

        {/* Stats bar */}
        <div
          className="grid grid-cols-3 gap-px mx-5 mt-4 rounded-xl overflow-hidden"
          style={{ background: 'rgba(255,255,255,.15)' }}
        >
          {[
            { num: eventCount, lbl: t('User.Events.title') },
            { num: poolSubCount, lbl: t('User.Subscriptions.filterPool') },
            { num: subscriptionCount, lbl: t('User.Subscriptions.filterMemberFee') },
          ].map(({ num, lbl }) => (
            <div
              key={lbl}
              className="py-3 px-2 text-center"
              style={{ background: 'rgba(255,255,255,.08)' }}
            >
              <div className="text-[20px] font-extrabold leading-none">{num}</div>
              <div className="text-[10px] mt-0.5 leading-tight" style={{ opacity: 0.65 }}>
                {lbl}
              </div>
            </div>
          ))}
        </div>

        {/* Tags: IDs + groups — outside gradient on mobile, shown below */}
        <div className="flex flex-wrap gap-1.5 px-5 py-4">
          <span
            className="text-[11px] font-semibold px-[10px] py-1 rounded-full tracking-[.3px]"
            style={{ background: 'rgba(255,255,255,.15)', color: '#fff' }}
          >
            {t('User.Profile.associateId', { id: user.associateId || 0 })}
          </span>
          {user.federationId && (
            <span
              className="text-[11px] font-semibold px-[10px] py-1 rounded-full tracking-[.3px]"
              style={{ background: 'rgba(255,255,255,.15)', color: '#fff' }}
            >
              {t('User.Profile.federationId', { id: user.federationId })}
            </span>
          )}
          {userGroups && userGroups.length > 0 && <UserGroups groups={userGroups} compact />}
        </div>
      </div>
    </div>
  )
}
