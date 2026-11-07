export type StepState = 'done' | 'now' | 'todo' | 'fail'

export interface TimelineStep {
  label: string
  /** The time or note under the label. */
  note?: string
  state: StepState
}

export interface StepLabel {
  label: string
  note?: string
}

/** The seven states a sender's booking moves through. */
export const bookingSteps: readonly string[] = [
  'Requested',
  'Accepted',
  'Picked up',
  'In transit',
  'Delivered',
  'Receipt confirmed',
  'Rated',
]

/** The four a rider or recipient sees. */
export const deliverySteps: readonly string[] = [
  'Accepted',
  'Started',
  'Arrived',
  'Confirmed',
]

/**
 * Builds the step states from how far a sequence has got.
 *
 * `reached` is the number of completed steps, so the step at that index is
 * the current one — unless the sequence failed there, which is what
 * `failedAt` marks. A failed step is neither done nor pending: it ends the
 * sequence, and the design draws it with a cross.
 */
export function stepsUpTo(
  labels: readonly StepLabel[],
  reached: number,
  options?: { failedAt?: number },
): TimelineStep[] {
  return labels.map((step, index) => {
    const base: StepLabel =
      step.note === undefined ? { label: step.label } : step
    if (options?.failedAt === index) return { ...base, state: 'fail' }
    if (index < reached) return { ...base, state: 'done' }
    if (index === reached) return { ...base, state: 'now' }
    return { ...base, state: 'todo' }
  })
}

/** The spoken form of a step's state, so it is not carried by colour alone. */
export function stepStateWord(state: StepState): string {
  switch (state) {
    case 'done':
      return 'done'
    case 'now':
      return 'in progress'
    case 'fail':
      return 'failed'
    case 'todo':
      return 'not started'
  }
}
