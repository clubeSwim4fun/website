import { getTranslations } from 'next-intl/server'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { getPayload } from 'payload'
import config from '@payload-config'

type Args = {
  userId: string
}

export const UserEvents: React.FC<Args> = async (props) => {
  const { userId } = props
  const t = await getTranslations()
  const payload = await getPayload({ config })
  const ordersCollection = await payload.find({
    collection: 'orders',
    sort: '-createdAt', // todo check field name
    where: {
      user: {
        equals: userId,
      },
    },
    depth: 2,
  })

  // console.log('orders', ordersCollection.docs[0].events)

  return (
    <article>
      <h2>{t('User.Events.title')}</h2>
      <Table className="w-full">
        <TableHeader className="bg-gray-100 dark:bg-slate-900">
          <TableRow className="border-b dark:border-slate-700">
            <TableHead className="text-left max-w-[50%]">{t('User.Events.name')}</TableHead>
            <TableHead className="text-left max-w-[50%]">{t('User.Events.distance')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow className="border-b dark:border-slate-700">
            <TableCell className="text-left max-w-[50%]">Item</TableCell>
            <TableCell className="text-left max-w-[50%]">Item</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </article>
  )
}
