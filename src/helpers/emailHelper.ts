'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { Header } from '@/payload-types'

export const getLogo = async () => {
  const globals = (await getCachedGlobal('header', 2, 'pt')()) as Header
  return globals.logo
}

export async function sendEmail(emailHtml: string) {
  const payload = await getPayload({ config })

  console.log('email html', emailHtml)

  // const email = await payload.sendEmail({
  //   subject: 'test website',
  //   to: 'lgperez.gustavo@gmail.com',
  //   html: emailHtml,
  // })

  // console.log('email', email)
}
