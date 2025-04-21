import { User } from '@/payload-types'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import FpnIcon from '../Icons/fpn'
import { getTranslations } from 'next-intl/server'
import { SquareUserRound } from 'lucide-react'
import { getLogo } from '@/helpers/emailHelper'
import { ImageMedia } from '../Media/ImageMedia'
import { UserGroups } from './user-groups'

export const UserProfile: React.FC<{ user: User }> = async (props) => {
  const { user } = props
  const t = await getTranslations('User.Profile')
  const logo = await getLogo()
  const userGroups = user.groups?.map((g) => g.value)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('profileTitle')}</CardTitle>
        <p className="flex gap-2 items-center text-sm">
          {logo ? (
            <ImageMedia imgClassName="h-4 w-4" resource={logo} />
          ) : (
            <SquareUserRound className="w-4 h-4" />
          )}
          {t('associateId', { id: user.associateId || 0 })}
        </p>

        {user.federationId && (
          <p className="flex gap-2 items-center text-sm">
            <FpnIcon className="w-4 h-4" />
            {t('federationId', { id: user.federationId })}
          </p>
        )}
      </CardHeader>
      <CardContent>
        <CardTitle heading="h3">{t('groups')}</CardTitle>
        <UserGroups groups={userGroups} />
      </CardContent>
    </Card>
  )
}
