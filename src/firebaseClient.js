import { initializeApp } from 'firebase/app'
import { getDatabase, onValue, ref, set } from 'firebase/database'

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const hasFirebaseConfig =
  config.apiKey &&
  config.authDomain &&
  config.databaseURL &&
  config.projectId &&
  config.messagingSenderId &&
  config.appId

let database = null

if (hasFirebaseConfig) {
  const app = initializeApp(config)
  database = getDatabase(app)
}

export function firebaseEnabled() {
  return Boolean(database)
}

export function subscribeRemoteData(onData, onError) {
  if (!database) {
    return () => {}
  }

  const rootRef = ref(database, 'olympiadeData')
  return onValue(rootRef, (snapshot) => onData(snapshot.val()), onError)
}

export async function saveRemoteData(data) {
  if (!database) {
    throw new Error('Firebase er ikke sat op')
  }

  await set(ref(database, 'olympiadeData'), data)
}
