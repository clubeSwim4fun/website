import { User } from '@/payload-types'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import flags from 'react-phone-number-input/flags'
import { getFormatter, getLocale, getTranslations } from 'next-intl/server'
import { getCountryCode } from '@/helpers/userHelper'

const FlagComponent = ({ country, countryName }: { country: string; countryName: string }) => {
  const Flag = flags[country as keyof typeof flags]

  return (
    <span className="flex h-4 w-6 overflow-hidden rounded-sm bg-foreground/20 [&_svg]:size-full">
      {Flag && <Flag title={countryName} />}
    </span>
  )
}

export const UserDetails: React.FC<{ user: User }> = async (props) => {
  const { user } = props
  const t = await getTranslations('User.Details')
  const locale = await getLocale()
  const format = await getFormatter({ locale })
  const nationality = user.nationality as string
  const countryCode = (await getCountryCode(nationality)) || 'PT'

  return (
    <article className="flex flex-col gap-4 w-full justify-center items-center lg:items-start">
      <h1 className="text-center lg:text-left text-2xl md:text-4xl lg:text-7xl text-blueSwim font-bold font-serif uppercase">{`${user.name} ${user.surname}`}</h1>

      <Tabs defaultValue="myData" className="w-auto lg:w-full">
        <TabsList className="w-full bg-transparent items-start gap-6 justify-start">
          <TabsTrigger value="myData">{t('myData')}</TabsTrigger>
          {user.Address && <TabsTrigger value="myAddress">{t('myAddress')}</TabsTrigger>}
        </TabsList>
        <TabsContent value="myData" className="grid grid-flow-col lg:grid-flow-row gap-4 text-sm">
          <div className="grid lg:grid-cols-12 gap-4">
            <div className="col-span-4 flex flex-col">
              <strong className="uppercase">{t('nif')}</strong>
              {`${user.nif}`}
            </div>
            <div className="col-span-4 flex flex-col">
              <strong className="capitalize">{t('identity')}</strong>
              {`${user.identity}`}
            </div>
            <div className="col-span-4 flex flex-col">
              <strong className="capitalize">{t('nationality')}</strong>
              <FlagComponent country={countryCode} countryName={nationality} />
            </div>
          </div>
          {/* Second line */}
          <div className="grid lg:grid-cols-12 gap-4">
            {user.birthDate && (
              <div className="col-span-4 flex flex-col">
                <strong className="capitalize">{t('birthday')}</strong>
                {format.dateTime(new Date(user.birthDate))}
              </div>
            )}
            <div className="col-span-4 flex flex-col">
              <strong className="capitalize">{t('phone')}</strong>
              {`${user.phone}`}
            </div>
            <div className="col-span-4 flex flex-col">
              <strong className="capitalize">{t('gender')}</strong>
              {typeof user.gender === 'object' ? user.gender?.value : user.gender}
            </div>
          </div>
        </TabsContent>
        {user.Address && (
          <TabsContent
            value="myAddress"
            className="grid grid-flow-col lg:grid-flow-row gap-4 text-sm"
          >
            <div className="grid lg:grid-cols-12 gap-4">
              <div className="col-span-4 flex flex-col">
                <strong className="capitalize">{t('street')}</strong>
                {user.Address.street}
              </div>
              <div className="col-span-4 flex flex-col">
                <strong className="capitalize">{t('number')}</strong>
                {user.Address.number}
              </div>
              <div className="col-span-4 flex flex-col">
                <strong className="capitalize">{t('state')}</strong>
                {user.Address.state}
              </div>
            </div>
            {/* Second line */}
            <div className="grid lg:grid-cols-12 gap-4">
              {user.birthDate && (
                <div className="col-span-4 flex flex-col">
                  <strong className="capitalize">{t('zipcode')}</strong>
                  {user.Address.zipcode}
                </div>
              )}
            </div>
          </TabsContent>
        )}
      </Tabs>
    </article>
  )
}
