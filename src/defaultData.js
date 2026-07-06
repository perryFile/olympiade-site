export const defaultData = {
  participants: [
    {
      id: 'participant-emma',
      name: 'Emma',
      teamId: 'team-humlehelte',
      imageUrl: '',
    },
    {
      id: 'participant-mikkel',
      name: 'Mikkel',
      teamId: 'team-skumbrigaden',
      imageUrl: '',
    },
    {
      id: 'participant-sofie',
      name: 'Sofie',
      teamId: 'team-humlehelte',
      imageUrl: '',
    },
  ],
  teams: [
    {
      id: 'team-humlehelte',
      name: 'Humleheltene',
      imageUrl: '',
    },
    {
      id: 'team-skumbrigaden',
      name: 'Skumbrigaden',
      imageUrl: '',
    },
  ],
  activities: [
    {
      id: 'activity-stafet',
      name: 'Stafet med fad',
      description: 'Hvem klarer banen hurtigst uden at spilde?',
      location: 'Plænen ved klubhuset',
    },
    {
      id: 'activity-quiz',
      name: 'Øl-quiz',
      description: 'Klassiske spørgsmål, bonuspoint og finaleheat.',
      location: 'Telt A',
    },
  ],
  schedule: [
    {
      id: 'schedule-1',
      start: '10:00',
      end: '10:30',
      title: 'Velkomst og holdfoto',
      location: 'Hovedscenen',
    },
    {
      id: 'schedule-2',
      start: '10:45',
      end: '12:00',
      title: 'Stafet med fad',
      location: 'Plænen ved klubhuset',
    },
    {
      id: 'schedule-3',
      start: '13:00',
      end: '14:00',
      title: 'Øl-quiz',
      location: 'Telt A',
    },
  ],
  scores: {
    'participant-emma': 12,
    'participant-mikkel': 9,
    'participant-sofie': 14,
  },
}
