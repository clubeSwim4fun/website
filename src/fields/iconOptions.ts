/**
 * Shared icon registry — single source of truth for all icon select fields.
 * Import `ICON_OPTIONS` for Payload field options and `ICON_MAP` for React rendering.
 */
import type { Option } from 'payload'

export const ICON_OPTIONS: Option[] = [
  { label: { en: 'None', pt: 'Nenhum' }, value: 'none' },
  { label: { en: 'Shield', pt: 'Escudo' }, value: 'shield' },
  { label: { en: 'Health / Activity', pt: 'Saúde / Atividade' }, value: 'activity' },
  { label: { en: 'Star', pt: 'Estrela' }, value: 'star' },
  { label: { en: 'People / Users', pt: 'Pessoas / Utilizadores' }, value: 'users' },
  { label: { en: 'Heart', pt: 'Coração' }, value: 'heart' },
  { label: { en: 'Trophy', pt: 'Troféu' }, value: 'trophy' },
  { label: { en: 'Clock / Time', pt: 'Relógio / Tempo' }, value: 'clock' },
  { label: { en: 'Calendar', pt: 'Calendário' }, value: 'calendar' },
  { label: { en: 'Map Pin', pt: 'Localização' }, value: 'mapPin' },
  { label: { en: 'Flag / Check', pt: 'Bandeira / Check' }, value: 'flag' },
  { label: { en: 'Arrow', pt: 'Seta' }, value: 'arrow' },
  { label: { en: 'Cloud / Upload', pt: 'Nuvem / Upload' }, value: 'cloud' },
]
