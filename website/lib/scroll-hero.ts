export const HERO_MOTION_KEY = 'putt-brothers-v2-hero-motion-v1'
export const iaapaExpo = {
  name: 'IAAPA Expo 2026',
  dates: 'November 17-20, 2026',
  booth: 'W2701',
  location: 'Orlando, Florida',
  building: 'West Building',
  href: '/contact#contact',
  cta: "Let’s meet at IAAPA",
  mapHref: 'https://iaapaexpo26.mapyourshow.com/8_0/floorplan/index.cfm?hallID=A&level=1&selectedBooth=booth%7EW2701',
} as const
export const clamp = (value: number, min = 0, max = 1) => Math.max(min, Math.min(max, value))
export function smooth(start: number, end: number, value: number) {
  const x = clamp((value - start) / (end - start))
  return x * x * (3 - 2 * x)
}
export function mediaTimeForProgress(progress: number, duration: number) {
  return clamp((progress - 0.035) / 0.905) * Math.max(0, duration - 1 / 24)
}

// Timing follows the supplied 28.125 s edit, not the earlier image storyboard.
export const heroChapters = [
  {
    id: 'minigolf', start: 2.6, end: 7.7, position: 'right', direction: 'right',
    label: '01 / Your starting point.', title: 'Your vision', accent: 'sets the direction.',
    body: 'What you want to create, who it’s for and what your business needs guide the project.',
  },
  {
    id: 'destination', start: 8.1, end: 12.8, position: 'low-left', direction: 'up',
    label: '02 / The guest experience', title: 'Think about', accent: 'their whole visit.',
    body: 'From the first impression to the final game, we consider how guests move, interact and spend time together. Those moments shape the space we design.',
  },
  {
    id: 'racing', start: 13.2, end: 17.6, position: 'left', direction: 'left',
    label: '03 / Connected design', title: 'Every element', accent: 'works together.',
    body: 'The attractions, interiors, lighting and technology are developed as parts of one experience, with each decision supporting how the place feels and functions.',
  },
  {
    id: 'space-z', start: 18, end: 22.1, position: 'right', direction: 'right',
    label: '04 / From ideas to reality', title: 'One team.', accent: 'Every step connected.',
    body: 'We coordinate design, engineering, manufacturing and installation around your project, with support that continues after the doors open.',
  },
  {
    id: 'project', start: 22.5, end: 29, position: 'final', direction: 'up',
    label: '05 / Your next big attraction', title: 'Meet the team', accent: 'at IAAPA Expo 2026',
    body: 'Visit us to explore the experience and talk with the team about what you want to create.',
    expo: true, cta: iaapaExpo.cta, href: iaapaExpo.href,
  },
] as const

export function chapterPresentation(time: number, index: number) {
  const chapter = heroChapters[index]
  const entrance = smooth(chapter.start, chapter.start + 0.65, time)
  const exit = index === heroChapters.length - 1 ? 0 : smooth(chapter.end - 0.55, chapter.end, time)
  return { opacity: entrance * (1 - exit), offset: (1 - entrance) * 44 - exit * 26 }
}
