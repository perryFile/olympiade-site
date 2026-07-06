import { useMemo, useState } from 'react'
import { Link, Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import { uploadRemoteImage } from './firebaseClient'
import { useTournamentData } from './useTournamentData'

const ADMIN_PATH = (import.meta.env.VITE_ADMIN_PATH || '/baglokale-olympiade').replace(/^\//, '')
const ASSET_BASE = import.meta.env.BASE_URL

function createId(prefix) {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function sortSchedule(items) {
  return [...items].sort((a, b) => `${a.start}-${a.end}`.localeCompare(`${b.start}-${b.end}`))
}

function getMemberNames(teamId, participants) {
  return participants
    .filter((participant) => participant.teamId === teamId)
    .map((participant) => participant.name)
}

function publicTotals(data) {
  return [...data.participants]
    .map((participant) => ({
      participant,
      points: Number(data.scores?.[participant.id] || 0),
    }))
    .sort((a, b) => b.points - a.points)
}

function teamTotals(data) {
  return data.teams
    .map((team) => {
      const members = data.participants.filter((participant) => participant.teamId === team.id)
      const total = members.reduce((sum, member) => sum + Number(data.scores?.[member.id] || 0), 0)
      return {
        team,
        members,
        total,
      }
    })
    .sort((a, b) => b.total - a.total)
}

function HomePage({ data, sourceLabel, isSyncing, syncError }) {
  const leaderboard = useMemo(() => publicTotals(data), [data])
  const teams = useMemo(() => teamTotals(data), [data])

  return (
    <div className="page">
      <header className="hero" id="top">
        <div className="hero__bg-shape" aria-hidden="true" />
        <img
          className="hero__logo"
          src={`${ASSET_BASE}logo-olympiade.svg`}
          alt="ØLympiade logo"
          onError={(event) => {
            event.currentTarget.src = `${ASSET_BASE}favicon.svg`
          }}
        />
        <p className="eyebrow">Turneringsdag</p>
        <h1>ØLympiade 2026</h1>
        <p className="hero__text">
          Velkommen til den mest legendariske dag i kalenderen. Hold, aktiviteter og live leaderboard opdateres
          løbende.
        </p>
        <nav className="quick-nav" aria-label="Hurtig navigation">
          <a href="#leaderboard">Leaderboard</a>
          <a href="#teams">Hold</a>
          <a href="#participants">Deltagere</a>
          <a href="#activities">Aktiviteter</a>
          <a href="#schedule">Tidsplan</a>
        </nav>
      </header>

      <main className="content">
        <section className="status-card">
          <p>
            Datasource: <strong>{sourceLabel}</strong>
          </p>
          <p>{isSyncing ? 'Synkroniserer...' : 'Data er opdateret'}</p>
          {syncError ? <p className="status-card__error">Fejl: {syncError}</p> : null}
        </section>

        <section id="leaderboard" className="panel">
          <h2>Leaderboard</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Placering</th>
                  <th>Deltager</th>
                  <th>Hold</th>
                  <th>Point</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((item, index) => {
                  const team = data.teams.find((candidate) => candidate.id === item.participant.teamId)
                  return (
                    <tr key={item.participant.id}>
                      <td>{index + 1}</td>
                      <td>{item.participant.name}</td>
                      <td>{team?.name || 'Intet hold'}</td>
                      <td>{item.points}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section id="teams" className="panel">
          <h2>Hold</h2>
          <div className="grid cards-3">
            {teams.map(({ team, members, total }) => (
              <article className="card" key={team.id}>
                <img
                  className="card__image"
                  src={team.imageUrl || '/favicon.svg'}
                  alt={`Holdbillede for ${team.name}`}
                />
                <h3>{team.name}</h3>
                <p>Holdpoint: {total}</p>
                <p className="muted">Medlemmer: {members.length}</p>
                <ul>
                  {getMemberNames(team.id, data.participants).map((name) => (
                    <li key={`${team.id}-${name}`}>{name}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section id="participants" className="panel">
          <h2>Deltagere</h2>
          <div className="grid cards-3">
            {data.participants.map((participant) => {
              const team = data.teams.find((candidate) => candidate.id === participant.teamId)
              return (
                <article className="card" key={participant.id}>
                  <img
                    className="card__image"
                    src={participant.imageUrl || '/favicon.svg'}
                    alt={`Profilbillede af ${participant.name}`}
                  />
                  <h3>{participant.name}</h3>
                  <p>{team?.name || 'Ikke på hold endnu'}</p>
                </article>
              )
            })}
          </div>
        </section>

        <section id="activities" className="panel">
          <h2>Aktiviteter</h2>
          <div className="grid cards-2">
            {data.activities.map((activity) => (
              <article className="card" key={activity.id}>
                <h3>{activity.name}</h3>
                <p>{activity.description}</p>
                <p className="muted">Lokation: {activity.location}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="schedule" className="panel">
          <h2>Tidsplan</h2>
          <ol className="timeline">
            {sortSchedule(data.schedule).map((entry) => (
              <li key={entry.id}>
                <span className="timeline__time">
                  {entry.start} - {entry.end}
                </span>
                <div>
                  <h3>{entry.title}</h3>
                  <p className="muted">{entry.location}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </main>
    </div>
  )
}

function AdminPage({ data, saveData, sourceLabel, isSyncing, syncError }) {
  const [participantForm, setParticipantForm] = useState({
    id: '',
    name: '',
    teamId: '',
    imageUrl: '',
    imageFile: null,
  })
  const [teamForm, setTeamForm] = useState({ id: '', name: '', imageUrl: '', imageFile: null })
  const [activityForm, setActivityForm] = useState({ id: '', name: '', description: '', location: '' })
  const [scheduleForm, setScheduleForm] = useState({ id: '', start: '', end: '', title: '', location: '' })
  const [saveMessage, setSaveMessage] = useState('')

  async function resolveImageUrl(file, existingUrl, folder) {
    if (!file) {
      return existingUrl
    }
    return uploadRemoteImage(file, `${folder}/${Date.now()}-${file.name}`)
  }

  async function saveParticipant(event) {
    event.preventDefault()
    const id = participantForm.id || createId('participant')
    const imageUrl = await resolveImageUrl(participantForm.imageFile, participantForm.imageUrl, 'participants')

    await saveData((prev) => {
      const nextParticipants = [...prev.participants]
      const index = nextParticipants.findIndex((participant) => participant.id === id)
      const record = {
        id,
        name: participantForm.name.trim(),
        teamId: participantForm.teamId || '',
        imageUrl,
      }
      if (index >= 0) {
        nextParticipants[index] = record
      } else {
        nextParticipants.push(record)
      }

      return {
        ...prev,
        participants: nextParticipants,
      }
    })

    setParticipantForm({ id: '', name: '', teamId: '', imageUrl: '', imageFile: null })
    setSaveMessage('Deltager gemt')
  }

  async function saveTeam(event) {
    event.preventDefault()
    const id = teamForm.id || createId('team')
    const imageUrl = await resolveImageUrl(teamForm.imageFile, teamForm.imageUrl, 'teams')

    await saveData((prev) => {
      const nextTeams = [...prev.teams]
      const index = nextTeams.findIndex((team) => team.id === id)
      const record = {
        id,
        name: teamForm.name.trim(),
        imageUrl,
      }
      if (index >= 0) {
        nextTeams[index] = record
      } else {
        nextTeams.push(record)
      }

      return {
        ...prev,
        teams: nextTeams,
      }
    })

    setTeamForm({ id: '', name: '', imageUrl: '', imageFile: null })
    setSaveMessage('Hold gemt')
  }

  async function saveActivity(event) {
    event.preventDefault()
    const id = activityForm.id || createId('activity')

    await saveData((prev) => {
      const next = [...prev.activities]
      const index = next.findIndex((activity) => activity.id === id)
      const record = {
        id,
        name: activityForm.name.trim(),
        description: activityForm.description.trim(),
        location: activityForm.location.trim(),
      }

      if (index >= 0) {
        next[index] = record
      } else {
        next.push(record)
      }

      return {
        ...prev,
        activities: next,
      }
    })

    setActivityForm({ id: '', name: '', description: '', location: '' })
    setSaveMessage('Aktivitet gemt')
  }

  async function saveSchedule(event) {
    event.preventDefault()
    const id = scheduleForm.id || createId('schedule')

    await saveData((prev) => {
      const next = [...prev.schedule]
      const index = next.findIndex((entry) => entry.id === id)
      const record = {
        id,
        start: scheduleForm.start,
        end: scheduleForm.end,
        title: scheduleForm.title.trim(),
        location: scheduleForm.location.trim(),
      }

      if (index >= 0) {
        next[index] = record
      } else {
        next.push(record)
      }

      return {
        ...prev,
        schedule: next,
      }
    })

    setScheduleForm({ id: '', start: '', end: '', title: '', location: '' })
    setSaveMessage('Tidsplanspunkt gemt')
  }

  async function updateScore(participantId, value) {
    await saveData((prev) => ({
      ...prev,
      scores: {
        ...prev.scores,
        [participantId]: Number(value || 0),
      },
    }))
    setSaveMessage('Score opdateret')
  }

  async function deleteParticipant(id) {
    await saveData((prev) => {
      const nextScores = { ...prev.scores }
      delete nextScores[id]
      return {
        ...prev,
        participants: prev.participants.filter((participant) => participant.id !== id),
        scores: nextScores,
      }
    })
    setSaveMessage('Deltager slettet')
  }

  async function deleteTeam(id) {
    await saveData((prev) => ({
      ...prev,
      teams: prev.teams.filter((team) => team.id !== id),
      participants: prev.participants.map((participant) =>
        participant.teamId === id ? { ...participant, teamId: '' } : participant,
      ),
    }))
    setSaveMessage('Hold slettet')
  }

  return (
    <div className="page page--admin">
      <header className="admin-head">
        <h1>Admin: ØLympiade</h1>
        <p>
          Datasource: <strong>{sourceLabel}</strong> · {isSyncing ? 'Gemmer...' : 'Klar'}
        </p>
        <p className="muted">Brug dette panel til live-opdateringer under eventet.</p>
        <Link to="/" className="link-button">
          Til offentlig side
        </Link>
        {syncError ? <p className="status-card__error">Fejl: {syncError}</p> : null}
        {saveMessage ? <p className="status-card__ok">{saveMessage}</p> : null}
      </header>

      <main className="content admin-grid">
        <section className="panel">
          <h2>Deltager</h2>
          <form onSubmit={saveParticipant} className="form-stack">
            <label>
              Navn
              <input
                required
                value={participantForm.name}
                onChange={(event) => setParticipantForm((prev) => ({ ...prev, name: event.target.value }))}
              />
            </label>
            <label>
              Hold
              <select
                value={participantForm.teamId}
                onChange={(event) => setParticipantForm((prev) => ({ ...prev, teamId: event.target.value }))}
              >
                <option value="">Intet hold</option>
                {data.teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Billede URL (valgfri)
              <input
                value={participantForm.imageUrl}
                onChange={(event) => setParticipantForm((prev) => ({ ...prev, imageUrl: event.target.value }))}
              />
            </label>
            <label>
              Upload billede (valgfri)
              <input
                type="file"
                accept="image/*"
                onChange={(event) =>
                  setParticipantForm((prev) => ({ ...prev, imageFile: event.target.files?.[0] || null }))
                }
              />
            </label>
            <button type="submit">Gem deltager</button>
          </form>
          <ul className="admin-list">
            {data.participants.map((participant) => (
              <li key={participant.id}>
                <span>{participant.name}</span>
                <div className="admin-actions">
                  <button
                    type="button"
                    onClick={() =>
                      setParticipantForm({
                        id: participant.id,
                        name: participant.name,
                        teamId: participant.teamId || '',
                        imageUrl: participant.imageUrl || '',
                        imageFile: null,
                      })
                    }
                  >
                    Rediger
                  </button>
                  <button type="button" className="danger" onClick={() => deleteParticipant(participant.id)}>
                    Slet
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="panel">
          <h2>Hold</h2>
          <form onSubmit={saveTeam} className="form-stack">
            <label>
              Holdnavn
              <input
                required
                value={teamForm.name}
                onChange={(event) => setTeamForm((prev) => ({ ...prev, name: event.target.value }))}
              />
            </label>
            <label>
              Holdbillede URL (valgfri)
              <input
                value={teamForm.imageUrl}
                onChange={(event) => setTeamForm((prev) => ({ ...prev, imageUrl: event.target.value }))}
              />
            </label>
            <label>
              Upload holdbillede (valgfri)
              <input
                type="file"
                accept="image/*"
                onChange={(event) => setTeamForm((prev) => ({ ...prev, imageFile: event.target.files?.[0] || null }))}
              />
            </label>
            <button type="submit">Gem hold</button>
          </form>
          <ul className="admin-list">
            {data.teams.map((team) => (
              <li key={team.id}>
                <span>{team.name}</span>
                <div className="admin-actions">
                  <button
                    type="button"
                    onClick={() => setTeamForm({ id: team.id, name: team.name, imageUrl: team.imageUrl || '', imageFile: null })}
                  >
                    Rediger
                  </button>
                  <button type="button" className="danger" onClick={() => deleteTeam(team.id)}>
                    Slet
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="panel">
          <h2>Scorejustering</h2>
          <ul className="admin-list admin-list--scores">
            {data.participants.map((participant) => (
              <li key={participant.id}>
                <span>{participant.name}</span>
                <input
                  type="number"
                  defaultValue={Number(data.scores?.[participant.id] || 0)}
                  onBlur={(event) => updateScore(participant.id, event.target.value)}
                />
              </li>
            ))}
          </ul>
        </section>

        <section className="panel">
          <h2>Aktivitet</h2>
          <form onSubmit={saveActivity} className="form-stack">
            <label>
              Navn
              <input
                required
                value={activityForm.name}
                onChange={(event) => setActivityForm((prev) => ({ ...prev, name: event.target.value }))}
              />
            </label>
            <label>
              Beskrivelse
              <textarea
                required
                value={activityForm.description}
                onChange={(event) => setActivityForm((prev) => ({ ...prev, description: event.target.value }))}
              />
            </label>
            <label>
              Lokation
              <input
                required
                value={activityForm.location}
                onChange={(event) => setActivityForm((prev) => ({ ...prev, location: event.target.value }))}
              />
            </label>
            <button type="submit">Gem aktivitet</button>
          </form>
          <ul className="admin-list">
            {data.activities.map((activity) => (
              <li key={activity.id}>
                <span>{activity.name}</span>
                <button
                  type="button"
                  onClick={() =>
                    setActivityForm({
                      id: activity.id,
                      name: activity.name,
                      description: activity.description,
                      location: activity.location,
                    })
                  }
                >
                  Rediger
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="panel">
          <h2>Tidsplan</h2>
          <form onSubmit={saveSchedule} className="form-stack">
            <label>
              Start
              <input
                type="time"
                required
                value={scheduleForm.start}
                onChange={(event) => setScheduleForm((prev) => ({ ...prev, start: event.target.value }))}
              />
            </label>
            <label>
              Slut
              <input
                type="time"
                required
                value={scheduleForm.end}
                onChange={(event) => setScheduleForm((prev) => ({ ...prev, end: event.target.value }))}
              />
            </label>
            <label>
              Titel
              <input
                required
                value={scheduleForm.title}
                onChange={(event) => setScheduleForm((prev) => ({ ...prev, title: event.target.value }))}
              />
            </label>
            <label>
              Lokation
              <input
                required
                value={scheduleForm.location}
                onChange={(event) => setScheduleForm((prev) => ({ ...prev, location: event.target.value }))}
              />
            </label>
            <button type="submit">Gem tidsplan</button>
          </form>
          <ul className="admin-list">
            {sortSchedule(data.schedule).map((entry) => (
              <li key={entry.id}>
                <span>
                  {entry.start} {entry.title}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setScheduleForm({
                      id: entry.id,
                      start: entry.start,
                      end: entry.end,
                      title: entry.title,
                      location: entry.location,
                    })
                  }
                >
                  Rediger
                </button>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  )
}

function App() {
  const { data, saveData, sourceLabel, isSyncing, syncError } = useTournamentData()

  return (
    <Routes>
      <Route
        path="/"
        element={<HomePage data={data} sourceLabel={sourceLabel} isSyncing={isSyncing} syncError={syncError} />}
      />
      <Route
        path={`/${ADMIN_PATH}`}
        element={
          <AdminPage
            data={data}
            saveData={saveData}
            sourceLabel={sourceLabel}
            isSyncing={isSyncing}
            syncError={syncError}
          />
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
