export const HERO_MOTION_KEY = 'putt-brothers-v2-hero-motion-v1'
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
    label: '01 / Mini golf. More connection.', title: 'Make every putt', accent: 'a reason to stay.',
    body: 'Bring people together through play. Create a mini golf experience worth coming back for.',
  },
  {
    id: 'destination', start: 8.1, end: 12.8, position: 'low-left', direction: 'up',
    label: '02 / Your venue, reimagined', title: 'Your space.', accent: 'Their next destination.',
    body: 'Connect attractions, hospitality and atmosphere in one unforgettable place.',
  },
  {
    id: 'racing', start: 13.2, end: 17.6, position: 'left', direction: 'left',
    label: '03 / Immersive racing', title: 'Put your guests', accent: "in the driver’s seat.",
    body: 'Turn the thrill of the track into your next attraction. Bring immersive racing to your venue.',
  },
  {
    id: 'space-z', start: 18, end: 22.1, position: 'right', direction: 'right',
    label: '04 / Discover SPACE Z', title: 'Small putts.', accent: 'Big possibilities.',
    body: 'Give your guests a new world to play in. Find the themed attractions that fit your space.',
  },
  {
    id: 'project', start: 22.5, end: 29, position: 'final', direction: 'up',
    label: '05 / Build what comes next', title: 'Your next big attraction', accent: 'starts here.',
    body: 'Opening a new venue or growing an existing one? Let’s turn your space into a place people choose.',
    cta: 'Plan my entertainment project', href: '/contact#contact',
  },
] as const

export function chapterPresentation(time: number, index: number) {
  const chapter = heroChapters[index]
  const entrance = smooth(chapter.start, chapter.start + 0.65, time)
  const exit = index === heroChapters.length - 1 ? 0 : smooth(chapter.end - 0.55, chapter.end, time)
  return { opacity: entrance * (1 - exit), offset: (1 - entrance) * 44 - exit * 26 }
}
