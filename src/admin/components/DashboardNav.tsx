import React from 'react'
import { DefaultNav } from '@payloadcms/next/rsc'
import DashboardNavLinks from './DashboardNavLinks'

export default function DashboardNav() {
  return (
    <>
      <DefaultNav />
      <DashboardNavLinks />
    </>
  )
}
