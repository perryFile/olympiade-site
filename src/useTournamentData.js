import { useCallback, useEffect, useMemo, useState } from 'react'
import { defaultData } from './defaultData'
import { firebaseEnabled, saveRemoteData, subscribeRemoteData } from './firebaseClient'

const STORAGE_KEY = 'olympiade-data-v1'

function isLocalHost(hostname) {
  return hostname === 'localhost' || hostname === '127.0.0.1'
}

function mergeWithDefaults(data) {
  const incoming = data || {}
  return {
    participants: incoming.participants || defaultData.participants,
    teams: incoming.teams || defaultData.teams,
    activities: incoming.activities || defaultData.activities,
    schedule: incoming.schedule || defaultData.schedule,
    scores: incoming.scores || defaultData.scores,
  }
}

export function useTournamentData() {
  const remoteMode = firebaseEnabled()
  const canUseLocalStorageFallback =
    !remoteMode && typeof window !== 'undefined' && isLocalHost(window.location.hostname)

  const [data, setData] = useState(() => {
    if (remoteMode) {
      return defaultData
    }

    if (!canUseLocalStorageFallback) {
      return defaultData
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? mergeWithDefaults(JSON.parse(stored)) : defaultData
    } catch {
      return defaultData
    }
  })
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncError, setSyncError] = useState('')

  useEffect(() => {
    if (remoteMode) {
      const unsubscribe = subscribeRemoteData(
        (remoteData) => {
          if (remoteData) {
            setData(mergeWithDefaults(remoteData))
          } else {
            setData(defaultData)
          }
        },
        (error) => {
          setSyncError(error.message || 'Kunne ikke hente remote data')
        },
      )
      return () => unsubscribe()
    }

    return () => {}
  }, [remoteMode])

  const saveData = useCallback(
    async (updater) => {
      const nextData = typeof updater === 'function' ? updater(data) : updater

      try {
        setIsSyncing(true)
        setSyncError('')

        if (remoteMode) {
          await saveRemoteData(nextData)
        } else if (canUseLocalStorageFallback) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(nextData))
        } else {
          throw new Error('Live-data er ikke aktiv. Udfyld VITE_FIREBASE_* i GitHub Secrets og deploy igen.')
        }

        setData(nextData)
      } catch (error) {
        setSyncError(error.message || 'Kunne ikke gemme data')
      } finally {
        setIsSyncing(false)
      }
    },
    [data, remoteMode, canUseLocalStorageFallback],
  )

  const sourceLabel = useMemo(
    () => (remoteMode ? 'Firebase (live)' : 'Lokal browserdata (kun denne enhed)'),
    [remoteMode],
  )

  return {
    data,
    saveData,
    sourceLabel,
    isLiveMode: remoteMode,
    isSyncing,
    syncError,
  }
}
