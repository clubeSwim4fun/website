import React from 'react'
import { DefaultNav } from '@payloadcms/next/rsc'
import { ServerProps } from 'payload'
import DashboardNavLinks from './DashboardNavLinks'

export default function DashboardNav(props: ServerProps) {
  return (
    <>
      <DefaultNav {...props} />
      <DashboardNavLinks />
    </>
  )
}
