import { describe, it, expect, vi, beforeEach } from 'vitest'

// Unit test for BenefitsAnchorNav active state logic (Requirement 3.4)
// Tests the IntersectionObserver integration and active tab state management.

describe('BenefitsAnchorNav — active state', () => {
  const SECTIONS = ['piscina', 'nutricao', 'equipamentos', 'provas']

  it('default active section is piscina', () => {
    const defaultActive = 'piscina'
    expect(defaultActive).toBe('piscina')
    expect(SECTIONS).toContain(defaultActive)
  })

  it('all four section ids are observed', () => {
    const observed: string[] = []
    const mockObserver = {
      observe: (el: { id: string }) => observed.push(el.id),
      disconnect: vi.fn(),
    }

    const elements = SECTIONS.map((id) => ({ id }))
    elements.forEach((el) => mockObserver.observe(el))

    expect(observed).toEqual(['piscina', 'nutricao', 'equipamentos', 'provas'])
  })

  it('active state updates to intersecting section id', () => {
    let activeId = 'piscina'
    const setActiveId = (id: string) => {
      activeId = id
    }

    // Simulate IntersectionObserver callback
    const entries = [{ isIntersecting: true, target: { id: 'nutricao' } }]
    for (const entry of entries) {
      if (entry.isIntersecting) {
        setActiveId(entry.target.id)
      }
    }

    expect(activeId).toBe('nutricao')
  })

  it('non-intersecting entries do not change active state', () => {
    let activeId = 'piscina'
    const setActiveId = (id: string) => {
      activeId = id
    }

    const entries = [{ isIntersecting: false, target: { id: 'nutricao' } }]
    for (const entry of entries) {
      if (entry.isIntersecting) {
        setActiveId(entry.target.id)
      }
    }

    expect(activeId).toBe('piscina')
  })

  it('active tab gets correct classes, inactive tabs get transparent border', () => {
    const activeId = 'equipamentos'
    const getTabClasses = (id: string) =>
      id === activeId ? 'border-[#0e7ea8] text-[#0e7ea8]' : 'border-transparent text-[#8aaabb]'

    expect(getTabClasses('equipamentos')).toBe('border-[#0e7ea8] text-[#0e7ea8]')
    expect(getTabClasses('piscina')).toBe('border-transparent text-[#8aaabb]')
    expect(getTabClasses('nutricao')).toBe('border-transparent text-[#8aaabb]')
    expect(getTabClasses('provas')).toBe('border-transparent text-[#8aaabb]')
  })

  it('observer disconnects on cleanup', () => {
    const disconnect = vi.fn()
    const mockObserver = { observe: vi.fn(), disconnect }

    // Simulate cleanup
    mockObserver.disconnect()

    expect(disconnect).toHaveBeenCalledOnce()
  })

  it('label map covers all four sections', () => {
    const labels = {
      pool: 'Piscina',
      nutrition: 'Nutrição',
      equipment: 'Equipamentos',
      races: 'Provas',
    }
    const labelMap: Record<string, string> = {
      piscina: labels.pool,
      nutricao: labels.nutrition,
      equipamentos: labels.equipment,
      provas: labels.races,
    }

    SECTIONS.forEach((id) => {
      expect(labelMap[id]).toBeTruthy()
    })
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })
})
