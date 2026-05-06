import React from 'react'
import { TemplateEmail } from './template'

type Args = {
  athleteName: string
  slotDay: string
  slotTime: string
  acceptUrl: string
  rejectUrl: string
  expiresInMinutes: number
}

export default function PoolSlotAvailableEmail({
  athleteName,
  slotDay,
  slotTime,
  acceptUrl,
  rejectUrl,
  expiresInMinutes,
}: Args) {
  return (
    <TemplateEmail title="Vaga disponível na piscina!">
      <p>Olá {athleteName},</p>
      <p>
        Uma vaga abriu no horário <strong>{slotDay}</strong> às <strong>{slotTime}</strong>.
      </p>
      <p>
        Tens <strong>{expiresInMinutes} minutos</strong> para aceitar ou rejeitar esta vaga. Se não
        responderes a tempo, a vaga passará para o próximo na lista de espera.
      </p>
      <div style={{ margin: '24px 0', display: 'flex', gap: '12px' }}>
        <a
          href={acceptUrl}
          style={{
            display: 'inline-block',
            padding: '12px 28px',
            backgroundColor: '#22c55e',
            color: '#fff',
            borderRadius: '6px',
            textDecoration: 'none',
            fontWeight: 'bold',
            marginRight: '12px',
          }}
        >
          ✓ Aceitar vaga
        </a>
        <a
          href={rejectUrl}
          style={{
            display: 'inline-block',
            padding: '12px 28px',
            backgroundColor: '#ef4444',
            color: '#fff',
            borderRadius: '6px',
            textDecoration: 'none',
            fontWeight: 'bold',
          }}
        >
          ✗ Rejeitar
        </a>
      </div>
      <p style={{ fontSize: '13px', color: '#888' }}>
        Este link expira em {expiresInMinutes} minutos. Após esse tempo, a vaga será oferecida ao
        próximo atleta na lista de espera.
      </p>
    </TemplateEmail>
  )
}
