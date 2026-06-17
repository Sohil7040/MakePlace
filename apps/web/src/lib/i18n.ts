export const portfolioMessages = {
  en: {
    about: 'About',
    projects: 'Projects',
    skills: 'Skills',
    highlights: 'Highlights',
    badges: 'Badges Earned',
    viewProject: 'View Details',
    poweredBy: 'MakePlace Academy',
    language: 'ગુજરાતી',
    noContent: 'Portfolio content coming soon.',
    download: 'Download',
  },
  gu: {
    about: 'વિશે',
    projects: 'પ્રોજેક્ટ્સ',
    skills: 'કૌશલ્ય',
    highlights: 'મુખ્ય બિંદુઓ',
    badges: 'મેળવેલા બેજ',
    viewProject: 'વિગતો જુઓ',
    poweredBy: 'મેકરસ્પેસ એકેડેમી',
    language: 'English',
    noContent: 'પોર્ટફોલિયો સામગ્રી ટૂંક સમયમાં આવશે.',
    download: 'ડાઉનલોડ',
  },
} as const;

export type Locale = keyof typeof portfolioMessages;
