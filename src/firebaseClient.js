import { initializeApp } from 'firebase/app'
import { getDatabase, onValue, ref, set } from 'firebase/database'
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const hasFirebaseConfig =
  config.apiKey &&
  config.authDomain &&
  config.databaseURL &&
  config.projectId &&
  config.storageBucket &&
  config.messagingSenderId &&
  config.appId

let database = null
let storage = null

if (hasFirebaseConfig) {
  const app = initializeApp(config)
  database = getDatabase(app)
  storage = getStorage(app)
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('Kunne ikke laese billedfilen'))
    reader.readAsDataURL(file)
  })
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

export async function uploadRemoteImage(file, path) {
  if (!file) {
    return ''
  }

  if (!storage) {
    return fileToDataUrl(file)
  }

  const imageRef = storageRef(storage, path)
  await uploadBytes(imageRef, file)
  return getDownloadURL(imageRef)
}
