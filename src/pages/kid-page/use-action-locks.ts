import { useRef } from "react"

export function useActionLocks() {
  const actionLocksRef = useRef<Set<string>>(new Set())

  function acquireActionLock(key: string) {
    if (actionLocksRef.current.has(key)) {
      return false
    }

    actionLocksRef.current.add(key)
    return true
  }

  function releaseActionLock(key: string) {
    actionLocksRef.current.delete(key)
  }

  return {
    acquireActionLock,
    releaseActionLock,
  }
}
