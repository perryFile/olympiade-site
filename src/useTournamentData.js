import { useCallback, useEffect, useMemo, useState } from 'react'
import { defaultData } from './defaultData'
import { firebaseEnabled, saveRemoteData, subscribeRemoteData } from './firebaseClient'

const STORAGE_KEY = 'olympiade-data-v1'

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
  const [data, setData] = useState(() => {
    if (firebaseEnabled()) {
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

  const remoteMode = firebaseEnabled()

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
      let nextData
      setData((prev) => {
        nextData = typeof updater === 'function' ? updater(prev) : updater
        return nextData
      })

      try {
        setIsSyncing(true)
        setSyncError('')

        if (remoteMode) {
          await saveRemoteData(nextData)
        } else {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(nextData))
        }
      } catch (error) {
        setSyncError(error.message || 'Kunne ikke gemme data')
      } finally {
        setIsSyncing(false)
      }
    },
    [remoteMode],
  )

  const sourceLabel = useMemo(() => (remoteMode ? 'Firebase (live)' : 'Lokal browserdata'), [remoteMode])

  return {
    data,
    saveData,
    sourceLabel,
    isSyncing,
    syncError,
  }
}
