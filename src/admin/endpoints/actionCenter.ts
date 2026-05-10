import type { Endpoint } from 'payload'

// ─── /api/action-center/counts ────────────────────────────────────────────────
export const actionCenterCounts: Endpoint = {
  path: '/action-center/counts',
  method: 'get',
  handler: async (req) => {
    if (!req.user) return Response.json({ error: 'Unauthorized' }, { status: 401 })
    if ((req.user as any).role !== 'admin')
      return Response.json({ error: 'Forbidden' }, { status: 403 })

    const now = new Date()
    const h48 = new Date(now.getTime() - 48 * 60 * 60 * 1000)
    const h72 = new Date(now.getTime() - 72 * 60 * 60 * 1000)

    // Queue 1: pending registrations
    const regResult = await req.payload.find({
      collection: 'users',
      where: { status: { equals: 'pendingAnalysis' } },
      sort: 'createdAt',
      limit: 1,
    })
    const regCount = regResult.totalDocs
    const oldestReg = regResult.docs[0] ?? null

    // Queue 2: group subscriptions — payment cleared, admin approval pending
    const subResult = await req.payload.find({
      collection: 'group-subscription',
      where: {
        and: [{ paymentStatus: { equals: 'paid' } }, { status: { equals: 'pending' } }],
      },
      sort: 'createdAt',
      limit: 1,
    })
    const subCount = subResult.totalDocs
    const oldestSub = subResult.docs[0] ?? null

    // Queue 3: paid orders without dorsal (ticketPurchased=true, eventPurchaseId empty)
    const dorsalResult = await req.payload.find({
      collection: 'orders',
      where: {
        and: [
          { paymentStatus: { equals: 'paid' } },
          { 'events.tickets.ticketPurchased': { equals: true } },
          { 'events.tickets.eventPurchaseId': { exists: false } },
        ],
      },
      sort: 'createdAt',
      limit: 1,
    })
    const dorsalCount = dorsalResult.totalDocs
    const oldestDorsal = dorsalResult.docs[0] ?? null

    // Queue 4: form payments — paid, no handledAt
    const formResult = await req.payload.find({
      collection: 'form-payments',
      where: {
        and: [{ paymentStatus: { equals: 'paid' } }, { handledAt: { exists: false } }],
      },
      sort: 'createdAt',
      limit: 1,
    })
    const formCount = formResult.totalDocs
    const oldestForm = formResult.docs[0] ?? null

    // Urgency helper
    function urgency(oldest: any): 'red' | 'amber' | 'default' | 'none' {
      if (!oldest) return 'none'
      const d = new Date(oldest.createdAt)
      if (d < h72) return 'red'
      if (d < h48) return 'amber'
      return 'default'
    }

    const total = regCount + subCount + dorsalCount + formCount

    return Response.json({
      total,
      queues: {
        registrations: {
          count: regCount,
          urgency: urgency(oldestReg),
          oldestAt: oldestReg?.createdAt ?? null,
          oldestName: oldestReg
            ? `${(oldestReg as any).name ?? ''} ${(oldestReg as any).surname ?? ''}`.trim()
            : null,
        },
        subscriptions: {
          count: subCount,
          urgency: urgency(oldestSub),
          oldestAt: oldestSub?.createdAt ?? null,
          oldestName: oldestSub
            ? (() => {
                const u = (oldestSub as any).user
                return typeof u === 'object' && u !== null
                  ? `${u.name ?? ''} ${u.surname ?? ''}`.trim()
                  : null
              })()
            : null,
        },
        dorsals: {
          count: dorsalCount,
          urgency: urgency(oldestDorsal),
          oldestAt: oldestDorsal?.createdAt ?? null,
        },
        forms: {
          count: formCount,
          urgency: urgency(oldestForm),
          oldestAt: oldestForm?.createdAt ?? null,
          oldestName: oldestForm
            ? (() => {
                const u = (oldestForm as any).user
                return typeof u === 'object' && u !== null
                  ? `${u.name ?? ''} ${u.surname ?? ''}`.trim()
                  : null
              })()
            : null,
        },
        stories: { count: 0, urgency: 'none' as const, oldestAt: null },
      },
    })
  },
}

// ─── /api/action-center/registrations ────────────────────────────────────────
export const actionCenterRegistrations: Endpoint = {
  path: '/action-center/registrations',
  method: 'get',
  handler: async (req) => {
    if (!req.user) return Response.json({ error: 'Unauthorized' }, { status: 401 })
    if ((req.user as any).role !== 'admin')
      return Response.json({ error: 'Forbidden' }, { status: 403 })

    const url = new URL(req.url ?? '', 'http://localhost')
    const sort = url.searchParams.get('sort') ?? 'createdAt'
    const statusFilter = url.searchParams.get('status') ?? 'all'
    const search = url.searchParams.get('search') ?? ''

    const where: any = { status: { equals: 'pendingAnalysis' } }

    if (statusFilter === 'complete') {
      where['and'] = [
        { status: { equals: 'pendingAnalysis' } },
        { profilePicture: { exists: true } },
        { identityFile: { exists: true } },
        { nif: { exists: true } },
      ]
    } else if (statusFilter === 'missing') {
      where['or'] = [
        { and: [{ status: { equals: 'pendingAnalysis' } }, { profilePicture: { exists: false } }] },
        { and: [{ status: { equals: 'pendingAnalysis' } }, { identityFile: { exists: false } }] },
        { and: [{ status: { equals: 'pendingAnalysis' } }, { nif: { exists: false } }] },
      ]
    } else if (statusFilter === 'resubmission') {
      where['and'] = [
        { status: { equals: 'pendingAnalysis' } },
        { fieldsToUpdate: { exists: true } },
      ]
    }

    const sortMap: Record<string, string> = {
      oldest: 'createdAt',
      newest: '-createdAt',
      name: 'name',
      incomplete: 'createdAt',
    }

    const result = await req.payload.find({
      collection: 'users',
      where,
      sort: sortMap[sort] ?? 'createdAt',
      limit: 100,
      depth: 1,
    })

    const now = new Date()
    const h48 = new Date(now.getTime() - 48 * 60 * 60 * 1000)
    const h72 = new Date(now.getTime() - 72 * 60 * 60 * 1000)

    const docs = (result.docs as any[])
      .filter((u) => {
        if (!search) return true
        const q = search.toLowerCase()
        return (
          (u.name ?? '').toLowerCase().includes(q) ||
          (u.surname ?? '').toLowerCase().includes(q) ||
          (u.email ?? '').toLowerCase().includes(q)
        )
      })
      .map((u) => {
        const createdAt = new Date(u.createdAt)
        const urgency = createdAt < h72 ? 'red' : createdAt < h48 ? 'amber' : 'none'
        const isResubmission = Array.isArray(u.fieldsToUpdate) && u.fieldsToUpdate.length > 0

        return {
          id: u.id,
          name: u.name ?? '',
          surname: u.surname ?? '',
          email: u.email ?? '',
          nif: u.nif ?? null,
          phone: u.phone ?? null,
          birthDate: u.birthDate ?? null,
          identity: u.identity ?? null,
          gender: u.gender ?? null,
          nationality: u.nationality ?? null,
          // Additional fields
          associateId: u.associateId ?? null,
          federationId: u.federationId ?? null,
          tshirtSize: u.tshirtSize ?? null,
          sportInsurance: u.sportInsurance ?? null,
          emergencyContact: u.emergencyContact ?? null,
          emergencyPhone: u.emergencyPhone ?? null,
          emailNotificationsEnabled: u.emailNotificationsEnabled ?? false,
          mustResetPassword: u.mustResetPassword ?? false,
          address: u.Address
            ? {
                street: u.Address.street ?? null,
                number: u.Address.number ?? null,
                state: u.Address.state ?? null,
                zipcode: u.Address.zipcode ?? null,
              }
            : null,
          disability: Array.isArray(u.disability)
            ? u.disability.map((d: any) => {
                if (typeof d !== 'object' || d === null) return String(d)
                // label is localized — could be a string or { pt, en } object
                const label = d.label
                if (typeof label === 'string') return label
                if (typeof label === 'object' && label !== null) {
                  return label.pt ?? label.en ?? d.value ?? d.id
                }
                return d.value ?? d.id
              })
            : [],
          groups: Array.isArray(u.groups)
            ? u.groups.map((g: any) =>
                typeof g === 'object' && g !== null
                  ? { id: g.value ?? g.id, label: g.label ?? g.title ?? g.name ?? g.id }
                  : { id: g, label: g },
              )
            : [],
          heardAboutClub:
            typeof u.heardAboutClub === 'object' && u.heardAboutClub !== null
              ? (u.heardAboutClub.name ?? u.heardAboutClub.title ?? null)
              : null,
          createdAt: u.createdAt,
          urgency,
          isResubmission,
          fieldsToUpdate: u.fieldsToUpdate ?? [],
          hasProfilePicture: !!u.profilePicture,
          hasIdentityFile: Array.isArray(u.identityFile)
            ? u.identityFile.length > 0
            : !!u.identityFile,
          hasNif: !!u.nif,
          profilePicture:
            typeof u.profilePicture === 'object' && u.profilePicture !== null
              ? {
                  id: u.profilePicture.id,
                  url: u.profilePicture.url ?? null,
                  filename: u.profilePicture.filename ?? null,
                  mimeType: u.profilePicture.mimeType ?? null,
                }
              : null,
          identityFiles: Array.isArray(u.identityFile)
            ? u.identityFile.map((f: any) =>
                typeof f === 'object' && f !== null
                  ? {
                      id: f.id,
                      url: f.url ?? null,
                      filename: f.filename ?? null,
                      mimeType: f.mimeType ?? null,
                    }
                  : { id: f, url: null, filename: null, mimeType: null },
              )
            : u.identityFile
              ? [
                  typeof u.identityFile === 'object'
                    ? {
                        id: u.identityFile.id,
                        url: u.identityFile.url ?? null,
                        filename: u.identityFile.filename ?? null,
                        mimeType: u.identityFile.mimeType ?? null,
                      }
                    : { id: u.identityFile, url: null, filename: null, mimeType: null },
                ]
              : [],
        }
      })

    return Response.json({ docs, totalDocs: docs.length })
  },
}

// ─── /api/action-center/registrations/:id/approve ────────────────────────────
export const actionCenterApproveRegistration: Endpoint = {
  path: '/action-center/registrations/:id/approve',
  method: 'post',
  handler: async (req) => {
    if (!req.user) return Response.json({ error: 'Unauthorized' }, { status: 401 })
    if ((req.user as any).role !== 'admin')
      return Response.json({ error: 'Forbidden' }, { status: 403 })

    const id = req.routeParams?.id as string
    try {
      await req.payload.update({
        collection: 'users',
        id,
        data: { status: 'pendingPayment' },
      })
      return Response.json({ success: true })
    } catch (err) {
      return Response.json({ success: false, error: String(err) }, { status: 500 })
    }
  },
}

// ─── /api/action-center/registrations/:id/reject ─────────────────────────────
export const actionCenterRejectRegistration: Endpoint = {
  path: '/action-center/registrations/:id/reject',
  method: 'post',
  handler: async (req) => {
    if (!req.user) return Response.json({ error: 'Unauthorized' }, { status: 401 })
    if ((req.user as any).role !== 'admin')
      return Response.json({ error: 'Forbidden' }, { status: 403 })

    const id = req.routeParams?.id as string
    const body = (await req.json?.()) ?? {}
    const { fields, note } = body as { fields: string[]; note?: string }

    try {
      await req.payload.update({
        collection: 'users',
        id,
        data: {
          status: 'pendingUpdate',
          fieldsToUpdate: (fields ?? []) as any,
        },
      })
      return Response.json({ success: true })
    } catch (err) {
      return Response.json({ success: false, error: String(err) }, { status: 500 })
    }
  },
}

// ─── /api/action-center/subscriptions ────────────────────────────────────────
export const actionCenterSubscriptions: Endpoint = {
  path: '/action-center/subscriptions',
  method: 'get',
  handler: async (req) => {
    if (!req.user) return Response.json({ error: 'Unauthorized' }, { status: 401 })
    if ((req.user as any).role !== 'admin')
      return Response.json({ error: 'Forbidden' }, { status: 403 })

    const result = await req.payload.find({
      collection: 'group-subscription',
      where: {
        and: [{ paymentStatus: { equals: 'paid' } }, { status: { equals: 'pending' } }],
      },
      sort: 'createdAt',
      limit: 100,
      depth: 2,
    })

    const now = new Date()
    const h48 = new Date(now.getTime() - 48 * 60 * 60 * 1000)
    const h72 = new Date(now.getTime() - 72 * 60 * 60 * 1000)

    const docs = (result.docs as any[]).map((s) => {
      const createdAt = new Date(s.createdAt)
      const urgency = createdAt < h72 ? 'red' : createdAt < h48 ? 'amber' : 'none'
      const user = typeof s.user === 'object' ? s.user : null
      const group = typeof s.group === 'object' ? s.group : null

      return {
        id: s.id,
        createdAt: s.createdAt,
        urgency,
        transactionId: s.transactionId ?? null,
        paymentStatus: s.paymentStatus,
        user: user
          ? {
              id: user.id,
              name: user.name ?? '',
              surname: user.surname ?? '',
              email: user.email ?? '',
            }
          : null,
        group: group
          ? {
              id: group.id,
              title: group.title ?? group.name ?? '',
            }
          : null,
        submissionData: s.submissionData ?? [],
      }
    })

    return Response.json({ docs, totalDocs: docs.length })
  },
}

// ─── /api/action-center/subscriptions/:id/approve ────────────────────────────
export const actionCenterApproveSubscription: Endpoint = {
  path: '/action-center/subscriptions/:id/approve',
  method: 'post',
  handler: async (req) => {
    if (!req.user) return Response.json({ error: 'Unauthorized' }, { status: 401 })
    if ((req.user as any).role !== 'admin')
      return Response.json({ error: 'Forbidden' }, { status: 403 })

    const id = req.routeParams?.id as string
    try {
      await req.payload.update({
        collection: 'group-subscription',
        id,
        data: { status: 'approved' },
      })
      return Response.json({ success: true })
    } catch (err) {
      return Response.json({ success: false, error: String(err) }, { status: 500 })
    }
  },
}

// ─── /api/action-center/subscriptions/:id/reject ─────────────────────────────
export const actionCenterRejectSubscription: Endpoint = {
  path: '/action-center/subscriptions/:id/reject',
  method: 'post',
  handler: async (req) => {
    if (!req.user) return Response.json({ error: 'Unauthorized' }, { status: 401 })
    if ((req.user as any).role !== 'admin')
      return Response.json({ error: 'Forbidden' }, { status: 403 })

    const id = req.routeParams?.id as string
    try {
      await req.payload.update({
        collection: 'group-subscription',
        id,
        data: { status: 'rejected' },
      })
      return Response.json({ success: true })
    } catch (err) {
      return Response.json({ success: false, error: String(err) }, { status: 500 })
    }
  },
}

// ─── /api/action-center/dorsals ──────────────────────────────────────────────
export const actionCenterDorsals: Endpoint = {
  path: '/action-center/dorsals',
  method: 'get',
  handler: async (req) => {
    if (!req.user) return Response.json({ error: 'Unauthorized' }, { status: 401 })
    if ((req.user as any).role !== 'admin')
      return Response.json({ error: 'Forbidden' }, { status: 403 })

    const result = await req.payload.find({
      collection: 'orders',
      where: { paymentStatus: { equals: 'paid' } },
      sort: 'createdAt',
      limit: 200,
      depth: 2,
    })

    const rows: any[] = []

    for (const order of result.docs as any[]) {
      const user = typeof order.user === 'object' ? order.user : null
      for (const eventEntry of order.events ?? []) {
        const event = typeof eventEntry.event === 'object' ? eventEntry.event : null
        for (const ticketEntry of eventEntry.tickets ?? []) {
          if (ticketEntry.ticketPurchased && !ticketEntry.eventPurchaseId) {
            const ticket = typeof ticketEntry.ticket === 'object' ? ticketEntry.ticket : null
            rows.push({
              orderId: order.id,
              ticketEntryRef: ticketEntry,
              createdAt: order.createdAt,
              total: order.total,
              user: user
                ? {
                    id: user.id,
                    name: user.name ?? '',
                    surname: user.surname ?? '',
                    email: user.email ?? '',
                    federationId: user.federationId ?? null,
                    birthDate: user.birthDate ?? null,
                    gender: user.gender ?? null,
                  }
                : null,
              event: event
                ? {
                    id: event.id,
                    title: event.title ?? '',
                    startDate: event.startDate ?? event.start ?? null,
                  }
                : null,
              ticket: ticket
                ? {
                    id: ticket.id,
                    name: ticket.name ?? '',
                    category: ticket.category ?? null,
                    distance: ticket.distance ?? null,
                  }
                : null,
              tshirtSize: ticketEntry.tshirtSize ?? null,
              currentDorsal: ticketEntry.eventPurchaseId ?? null,
            })
          }
        }
      }
    }

    return Response.json({ docs: rows, totalDocs: rows.length })
  },
}

// ─── /api/action-center/dorsals/:orderId ─────────────────────────────────────
export const actionCenterSaveDorsal: Endpoint = {
  path: '/action-center/dorsals/:orderId',
  method: 'patch',
  handler: async (req) => {
    if (!req.user) return Response.json({ error: 'Unauthorized' }, { status: 401 })
    if ((req.user as any).role !== 'admin')
      return Response.json({ error: 'Forbidden' }, { status: 403 })

    const orderId = req.routeParams?.orderId as string
    const body = (await req.json?.()) ?? {}
    const { ticketId, dorsal } = body as { ticketId: string; dorsal: string }

    try {
      const order = await req.payload.findByID({
        collection: 'orders',
        id: orderId,
        depth: 0,
      })

      const updatedEvents = ((order as any).events ?? []).map((ev: any) => ({
        ...ev,
        tickets: (ev.tickets ?? []).map((t: any) => {
          const tId = typeof t.ticket === 'object' ? t.ticket.id : t.ticket
          if (tId === ticketId) {
            return { ...t, eventPurchaseId: dorsal }
          }
          return t
        }),
      }))

      await req.payload.update({
        collection: 'orders',
        id: orderId,
        data: { events: updatedEvents },
      })

      return Response.json({ success: true })
    } catch (err) {
      return Response.json({ success: false, error: String(err) }, { status: 500 })
    }
  },
}

// ─── /api/action-center/forms ────────────────────────────────────────────────
export const actionCenterForms: Endpoint = {
  path: '/action-center/forms',
  method: 'get',
  handler: async (req) => {
    if (!req.user) return Response.json({ error: 'Unauthorized' }, { status: 401 })
    if ((req.user as any).role !== 'admin')
      return Response.json({ error: 'Forbidden' }, { status: 403 })

    const result = await req.payload.find({
      collection: 'form-payments',
      where: {
        and: [{ paymentStatus: { equals: 'paid' } }, { handledAt: { exists: false } }],
      },
      sort: 'createdAt',
      limit: 100,
      depth: 2,
    })

    const now = new Date()
    const h48 = new Date(now.getTime() - 48 * 60 * 60 * 1000)
    const h72 = new Date(now.getTime() - 72 * 60 * 60 * 1000)

    const docs = await Promise.all(
      (result.docs as any[]).map(async (fp) => {
        const createdAt = new Date(fp.createdAt)
        const urgency = createdAt < h72 ? 'red' : createdAt < h48 ? 'amber' : 'none'
        const user = typeof fp.user === 'object' ? fp.user : null
        const form = typeof fp.form === 'object' ? fp.form : null
        const userId = user?.id ?? (typeof fp.user === 'string' ? fp.user : null)
        const formId = form?.id ?? (typeof fp.form === 'string' ? fp.form : null)

        // Build a label map from the form's fields definition
        const fieldLabelMap: Record<string, string> = {}
        const fileFieldNames = new Set<string>()
        if (form?.fields && Array.isArray(form.fields)) {
          for (const f of form.fields) {
            if (!f.name) continue
            const label =
              typeof f.label === 'string'
                ? f.label
                : typeof f.label === 'object' && f.label !== null
                  ? (f.label.pt ?? f.label.en ?? f.name)
                  : f.name
            fieldLabelMap[f.name] = label
            if (f.blockType === 'upload' || f.blockType === 'media' || f.type === 'upload') {
              fileFieldNames.add(f.name)
            }
          }
        }

        // Try to find the matching form-submission for richer data
        let submissionData: { field: string; label: string; value: string; isFile: boolean }[] = []

        if (formId) {
          try {
            const subResult = await req.payload.find({
              collection: 'form-submissions',
              where: { form: { equals: formId } },
              sort: '-createdAt',
              limit: 100,
              depth: 0,
            })

            // Pick the submission closest in time to this payment (no time limit)
            const paymentTime = new Date(fp.createdAt).getTime()
            let bestSub: any = null
            let bestDiff = Infinity
            for (const sub of subResult.docs as any[]) {
              const diff = Math.abs(new Date(sub.createdAt).getTime() - paymentTime)
              if (diff < bestDiff) {
                bestDiff = diff
                bestSub = sub
              }
            }

            if (bestSub?.submissionData && Array.isArray(bestSub.submissionData)) {
              submissionData = bestSub.submissionData
                .filter((d: any) => d.field && d.value)
                .map((d: any) => ({
                  field: d.field,
                  label: fieldLabelMap[d.field] ?? d.field,
                  value: d.value ?? '',
                  isFile: fileFieldNames.has(d.field) || isLikelyFilename(d.value),
                }))
            }
          } catch {
            // form-submissions may not exist — fall back to fp.submissionData
          }
        }

        // Fall back to the snapshot stored on the payment record
        if (
          submissionData.length === 0 &&
          Array.isArray(fp.submissionData) &&
          fp.submissionData.length > 0
        ) {
          submissionData = fp.submissionData.map((d: any) => ({
            field: d.field,
            label: fieldLabelMap[d.field] ?? d.field,
            value: d.value ?? '',
            isFile: fileFieldNames.has(d.field) || isLikelyFilename(d.value),
          }))
        }

        return {
          id: fp.id,
          createdAt: fp.createdAt,
          urgency,
          amount: fp.amount ?? 0,
          description: fp.description ?? null,
          user: user
            ? {
                id: user.id,
                name: user.name ?? '',
                surname: user.surname ?? '',
                email: user.email ?? '',
              }
            : null,
          form: form ? { id: form.id, title: form.title ?? form.name ?? '' } : null,
          submissionData,
        }
      }),
    )

    return Response.json({ docs, totalDocs: docs.length })
  },
}

function isLikelyFilename(value: string): boolean {
  if (!value || typeof value !== 'string') return false
  return /\.(png|jpg|jpeg|gif|webp|pdf|doc|docx|xls|xlsx|csv|zip|txt)$/i.test(value.trim())
}

// ─── /api/action-center/forms/:id/handle ─────────────────────────────────────
export const actionCenterHandleForm: Endpoint = {
  path: '/action-center/forms/:id/handle',
  method: 'post',
  handler: async (req) => {
    if (!req.user) return Response.json({ error: 'Unauthorized' }, { status: 401 })
    if ((req.user as any).role !== 'admin')
      return Response.json({ error: 'Forbidden' }, { status: 403 })

    const id = req.routeParams?.id as string
    const body = (await req.json?.()) ?? {}
    const { assignId, groupId, groupRelationTo, idNumber } = body as {
      assignId: boolean
      groupId?: string
      groupRelationTo?: 'groups' | 'group-categories'
      idNumber?: string
    }

    try {
      // Mark the form payment as handled
      await req.payload.update({
        collection: 'form-payments',
        id,
        data: { handledAt: new Date().toISOString() } as any,
      })

      if (!assignId || !groupId || !idNumber) {
        return Response.json({ success: true })
      }

      // Fetch the form payment to get the user
      const fp = await req.payload.findByID({
        collection: 'form-payments',
        id,
        depth: 1,
      })

      const userId = typeof (fp as any).user === 'object' ? (fp as any).user?.id : (fp as any).user

      if (!userId) {
        return Response.json(
          { success: false, error: 'User not found on form payment' },
          { status: 400 },
        )
      }

      const collection = groupRelationTo === 'group-categories' ? 'group-categories' : 'groups'

      // Fetch the group/subgroup to check if it's permanent
      const group = await req.payload.findByID({
        collection,
        id: groupId,
        depth: 0,
      })

      const isPermanent = (group as any).isPermanentId ?? false
      const userField = (group as any).userField as string | undefined

      if (isPermanent && userField) {
        // Save directly to the user record
        await req.payload.update({
          collection: 'users',
          id: userId,
          data: { [userField]: idNumber } as any,
        })
      } else {
        // Save to temporary-group-ids
        const season = `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`

        // Check if a record already exists for this user+group+season
        const existing = await req.payload.find({
          collection: 'temporary-group-ids',
          where: {
            and: [
              { user: { equals: userId } },
              { group: { equals: groupId } },
              { season: { equals: season } },
            ],
          },
          limit: 1,
        })

        if (existing.totalDocs > 0) {
          await req.payload.update({
            collection: 'temporary-group-ids',
            id: (existing.docs[0] as any).id,
            data: { number: idNumber },
          })
        } else {
          await req.payload.create({
            collection: 'temporary-group-ids',
            data: { user: userId, group: groupId, season, number: idNumber },
          })
        }
      }

      return Response.json({ success: true })
    } catch (err) {
      return Response.json({ success: false, error: String(err) }, { status: 500 })
    }
  },
}

// ─── /api/action-center/groups ────────────────────────────────────────────────
export const actionCenterGroups: Endpoint = {
  path: '/action-center/groups',
  method: 'get',
  handler: async (req) => {
    if (!req.user) return Response.json({ error: 'Unauthorized' }, { status: 401 })
    if ((req.user as any).role !== 'admin')
      return Response.json({ error: 'Forbidden' }, { status: 403 })

    const [groupsResult, subgroupsResult] = await Promise.all([
      req.payload.find({ collection: 'groups', limit: 200, depth: 0 }),
      req.payload.find({ collection: 'group-categories', limit: 200, depth: 0 }),
    ])

    const mapDoc = (g: any, relationTo: 'groups' | 'group-categories') => ({
      id: g.id,
      relationTo,
      title: typeof g.title === 'object' ? (g.title?.pt ?? g.title?.en ?? g.id) : (g.title ?? g.id),
      isPermanentId: g.isPermanentId ?? false,
      userField: g.userField ?? null,
    })

    const docs = [
      ...(groupsResult.docs as any[]).map((g) => mapDoc(g, 'groups')),
      ...(subgroupsResult.docs as any[]).map((g) => mapDoc(g, 'group-categories')),
    ]

    return Response.json({ docs })
  },
}
