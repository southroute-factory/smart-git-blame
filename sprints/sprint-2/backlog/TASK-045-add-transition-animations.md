# TASK-045: Add transition animations

| Field | Value |
|-------|-------|
| **Task ID** | TASK-045 |
| **Story** | STORY-007 |
| **Owner** | FE |
| **Estimate** | 1h |
| **Status** | Backlog |

## Description

Add smooth transition animations between loading and loaded states for better UX.

## Acceptance Criteria

- [ ] Fade-in animation when content replaces skeleton
- [ ] Slide animation for change panel open/close
- [ ] No jarring jumps or flashes
- [ ] Respect user's reduced-motion preference
- [ ] Animations are performant (use CSS transforms)

## Technical Notes

- Use CSS transitions or Framer Motion
- Consider `prefers-reduced-motion` media query
- Test on lower-end devices for performance

## Implementation

```typescript
// Using CSS transitions
const contentClasses = cn(
  'transition-opacity duration-300',
  isLoading ? 'opacity-0' : 'opacity-100'
);

// Using Framer Motion
import { motion, AnimatePresence } from 'framer-motion';

<AnimatePresence mode="wait">
  {isLoading ? (
    <motion.div
      key="skeleton"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <BlameViewSkeleton />
    </motion.div>
  ) : (
    <motion.div
      key="content"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <BlameView data={data} />
    </motion.div>
  )}
</AnimatePresence>
```

## Dependencies

- TASK-044 (Loading state integration)

## Blocked By

- TASK-044
