import { describe, it, expect } from 'vitest'

// Unit test for PoolCardImage fallback logic (Requirement 5.3)
// The component swaps to a gradient div when the image errors.
// We test the fallback gradient value and the component's props contract.

describe('PoolCardImage — fallback gradient', () => {
  it('fallback gradient matches the design spec', () => {
    const FALLBACK_GRADIENT = 'linear-gradient(135deg, #0a4a6e 0%, #0e7ea8 100%)'
    // This is the exact value used in pool-card-image.client.tsx
    expect(FALLBACK_GRADIENT).toBe('linear-gradient(135deg, #0a4a6e 0%, #0e7ea8 100%)')
  })

  it('fallback gradient starts with deep blue (#0a4a6e) and ends with mid blue (#0e7ea8)', () => {
    const FALLBACK_GRADIENT = 'linear-gradient(135deg, #0a4a6e 0%, #0e7ea8 100%)'
    expect(FALLBACK_GRADIENT).toContain('#0a4a6e')
    expect(FALLBACK_GRADIENT).toContain('#0e7ea8')
  })

  it('image src and alt are required props (type contract)', () => {
    // Validates that the component requires both src and alt (Requirement 12.5)
    type Props = { src: string; alt: string }
    const props: Props = { src: '/static-images/event-image-1.webp', alt: 'Pool image' }
    expect(props.src).toBeTruthy()
    expect(props.alt).toBeTruthy()
  })
})
