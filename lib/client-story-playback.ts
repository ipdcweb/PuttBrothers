export function storyIndex(index: number, count: number) {
  return count > 0 ? ((index % count) + count) % count : 0
}

export function storyOffset(index: number, active: number, count: number) {
  const offset = storyIndex(index - active, count)
  return offset > count / 2 ? offset - count : offset
}

export function mayPlayStory(options: {
  inView: boolean; visible: boolean; requested: boolean; loaded: boolean
  reducedMotion: boolean; saveData: boolean; userStarted: boolean
}) {
  return options.inView && options.visible && options.requested && options.loaded &&
    (options.userStarted || (!options.reducedMotion && !options.saveData))
}

export function mayAdvanceStory(options: {
  inView: boolean; visible: boolean; autoNext: boolean; keyboardFocus: boolean
  reducedMotion: boolean; saveData: boolean
}) {
  return options.inView && options.visible && options.autoNext && !options.keyboardFocus &&
    !options.reducedMotion && !options.saveData
}

export function storyTime(seconds: number) {
  const safe = Math.max(0, Math.floor(Number.isFinite(seconds) ? seconds : 0))
  return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, '0')}`
}
