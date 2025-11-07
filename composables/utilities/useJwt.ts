/**
 * Decode JWT token without verification
 * This is for client-side only to extract payload data
 */
export function useJwt() {
  const decodeToken = (token: string): any | null => {
    try {
      // Split token into parts
      const parts = token.split('.')
      if (parts.length !== 3) {
        return null
      }

      // Decode payload (second part)
      const payload = parts[1]
      const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
      return JSON.parse(decoded)
    } catch (error) {
      console.error('Failed to decode token:', error)
      return null
    }
  }

  return {
    decodeToken
  }
}
