import * as React from 'react'

export const Error: React.FC<{ error?: string }> = ({ error }) => {
  return <div className="mt-2 text-red-500 text-sm">{error || 'This field is required'}</div>
}
