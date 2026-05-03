'use client'

import React, { useState, useEffect } from 'react'
import { useTranslation } from '@payloadcms/ui'
import { performGroupReset } from '@/actions/groupReset'

const labels = {
  en: {
    title: '🗂️ Remove Group from All Users',
    selectLabel: 'Select a group to remove',
    selectPlaceholder: '— choose a group —',
    description: (name: string, count: number) =>
      `This will remove "${name}" from ${count} user(s). Only the group is removed — no other data is changed.`,
    warning: 'This action cannot be undone.',
    cancel: 'Cancel',
    confirm: 'Remove Group',
    confirming: '⏳ Removing...',
    fetchError: 'Could not load groups. Please try again.',
    countError: 'Could not fetch affected users.',
    resetFailed: (msg: string) => `❌ Failed: ${msg}`,
    resetSuccess: (count: number) => `✅ Group removed from ${count} user(s).`,
    noUsers: 'No users have this group assigned.',
  },
  pt: {
    title: '🗂️ Remover Grupo de Todos os Utilizadores',
    selectLabel: 'Selecione um grupo para remover',
    selectPlaceholder: '— escolha um grupo —',
    description: (name: string, count: number) =>
      `Isto irá remover "${name}" de ${count} utilizador(es). Apenas o grupo é removido — nenhum outro dado é alterado.`,
    warning: 'Esta ação não pode ser desfeita.',
    cancel: 'Cancelar',
    confirm: 'Remover Grupo',
    confirming: '⏳ A remover...',
    fetchError: 'Não foi possível carregar os grupos. Por favor tente novamente.',
    countError: 'Não foi possível obter os utilizadores afetados.',
    resetFailed: (msg: string) => `❌ Falhou: ${msg}`,
    resetSuccess: (count: number) => `✅ Grupo removido de ${count} utilizador(es).`,
    noUsers: 'Nenhum utilizador tem este grupo atribuído.',
  },
}

interface Group {
  id: string
  title: string
  relationTo: 'groups' | 'group-categories'
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (message: string) => void
  onError: (message: string) => void
}

export function GroupResetDialog({ open, onOpenChange, onSuccess, onError }: Props) {
  const { i18n } = useTranslation()
  const lang = i18n.language === 'pt' ? 'pt' : 'en'
  const t = labels[lang]

  const [groups, setGroups] = useState<Group[]>([])
  const [selectedGroupId, setSelectedGroupId] = useState('')
  const [affectedCount, setAffectedCount] = useState<number | null>(null)
  const [isLoadingGroups, setIsLoadingGroups] = useState(false)
  const [isLoadingCount, setIsLoadingCount] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Load groups + group-categories when dialog opens
  useEffect(() => {
    if (!open) return
    setSelectedGroupId('')
    setAffectedCount(null)
    setIsLoadingGroups(true)

    const resolveTitle = (title: any): string =>
      typeof title === 'object' ? (title.pt ?? title.en ?? '') : (title ?? '')

    Promise.all([
      fetch('/api/groups?limit=200&sort=title', { credentials: 'include' }).then((r) => r.json()),
      fetch('/api/group-categories?limit=200&sort=title', { credentials: 'include' }).then((r) =>
        r.json(),
      ),
    ])
      .then(([groupsData, catsData]) => {
        const fromGroups: Group[] = (groupsData.docs ?? []).map((g: any) => ({
          id: g.id,
          title: resolveTitle(g.title),
          relationTo: 'groups' as const,
        }))
        const fromCats: Group[] = (catsData.docs ?? []).map((g: any) => ({
          id: g.id,
          title: resolveTitle(g.title),
          relationTo: 'group-categories' as const,
        }))
        setGroups([...fromGroups, ...fromCats].sort((a, b) => a.title.localeCompare(b.title)))
      })
      .catch(() => onError(t.fetchError))
      .finally(() => setIsLoadingGroups(false))
  }, [open])

  // Fetch affected user count when group changes — fetch all users and count in JS
  // because Payload's polymorphic relationship field doesn't support `contains` filtering
  useEffect(() => {
    if (!selectedGroupId) {
      setAffectedCount(null)
      return
    }
    setIsLoadingCount(true)
    fetch(`/api/users?limit=0&pagination=false`, { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => {
        // totalDocs from limit=0 gives the count, but we need to actually check group membership
        // so fetch with a high limit to inspect groups
        return fetch(`/api/users?limit=1000&depth=0`, { credentials: 'include' }).then((r) =>
          r.json(),
        )
      })
      .then((data) => {
        const count = (data.docs ?? []).filter((u: any) => {
          const groups: any[] = u.groups ?? []
          return groups.some((g: any) => {
            const id = typeof g.value === 'string' ? g.value : (g.value?.id ?? g.value)
            return id === selectedGroupId
          })
        }).length
        setAffectedCount(count)
      })
      .catch(() => onError(t.countError))
      .finally(() => setIsLoadingCount(false))
  }, [selectedGroupId])

  const handleConfirm = async () => {
    if (!selectedGroupId) return
    setIsSubmitting(true)
    try {
      const result = await performGroupReset(selectedGroupId)
      onOpenChange(false)
      if (result.success) {
        onSuccess(t.resetSuccess(result.updatedCount ?? 0))
      } else {
        onError(t.resetFailed(result.message))
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isSubmitting && e.target === e.currentTarget) onOpenChange(false)
  }

  const selectedGroup = groups.find((g) => g.id === selectedGroupId)
  const canConfirm =
    !!selectedGroupId && !isSubmitting && !isLoadingCount && (affectedCount ?? 0) > 0

  if (!open) return null

  return (
    <div
      onClick={handleOverlayClick}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '8px',
          padding: '2rem',
          maxWidth: '480px',
          width: '90%',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#b91c1c' }}>
          {t.title}
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <label
            htmlFor="group-reset-select"
            style={{ fontSize: '0.875rem', fontWeight: 600, color: '#111827' }}
          >
            {t.selectLabel}
          </label>
          <select
            id="group-reset-select"
            value={selectedGroupId}
            onChange={(e) => setSelectedGroupId(e.target.value)}
            disabled={isLoadingGroups || isSubmitting}
            style={{
              padding: '0.5rem 0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '0.875rem',
              color: '#111827',
              backgroundColor: '#fff',
              cursor: isLoadingGroups ? 'wait' : 'pointer',
            }}
          >
            <option value="">{t.selectPlaceholder}</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.title}
              </option>
            ))}
          </select>
        </div>

        {selectedGroupId && (
          <div style={{ fontSize: '0.9rem', color: '#111827', lineHeight: 1.6 }}>
            {isLoadingCount ? (
              <p style={{ margin: 0, color: '#6b7280' }}>⏳ Checking affected users…</p>
            ) : affectedCount === 0 ? (
              <p style={{ margin: 0, color: '#6b7280' }}>{t.noUsers}</p>
            ) : (
              <>
                <p style={{ margin: '0 0 0.5rem' }}>
                  {t.description(selectedGroup?.title ?? '', affectedCount ?? 0)}
                </p>
                <p style={{ margin: 0, color: '#b91c1c', fontWeight: 600 }}>{t.warning}</p>
              </>
            )}
          </div>
        )}

        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '0.75rem',
            marginTop: '0.5rem',
          }}
        >
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              border: '1px solid #d1d5db',
              backgroundColor: '#fff',
              color: '#111827',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              fontSize: '0.875rem',
            }}
          >
            {t.cancel}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!canConfirm}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: canConfirm ? '#b91c1c' : '#fca5a5',
              color: '#fff',
              cursor: canConfirm ? 'pointer' : 'not-allowed',
              fontSize: '0.875rem',
              fontWeight: 600,
            }}
          >
            {isSubmitting ? t.confirming : t.confirm}
          </button>
        </div>
      </div>
    </div>
  )
}
