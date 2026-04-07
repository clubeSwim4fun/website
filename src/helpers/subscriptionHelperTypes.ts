export type SubscriptionRow =
  | {
      kind: 'memberFee'
      id: string
      startDate: string
      endDate: string
      amount: number
      paymentStatus: 'paid' | 'pending' | 'failed'
      stripePaymentIntentId?: string | null
      linkToSubscription?: boolean
    }
  | {
      kind: 'pool'
      id: string
      month: string
      year: number
      amount: number
      status: 'active' | 'waitlisted' | 'cancelled'
      paymentStatus: 'paid' | 'pending' | 'failed'
      stripePaymentIntentId?: string | null
      linkToMyPool?: boolean
    }

export type SubscriptionTypeFilter = 'all' | 'memberFee' | 'pool'
export type SubscriptionSortOrder = 'asc' | 'desc'

export type SubscriptionsResult = {
  rows: SubscriptionRow[]
  totalDocs: number
  totalPages: number
  page: number
}

export const SUBS_PAGE_SIZE = 5
