# A/B Testing Framework Guide

## Overview

This A/B testing framework allows you to run controlled experiments on features, reading plans, onboarding flows, and UI components to measure their impact on user engagement and retention.

## Features

- **Experiment Management**: Create, start, pause, and complete experiments
- **Variant Assignment**: Automatically assign users to variants based on configurable audience splits
- **Event Tracking**: Track user actions and measure experiment performance
- **Statistical Analysis**: Calculate statistical significance with confidence intervals
- **Results Dashboard**: Visual dashboard showing metrics and comparisons
- **localStorage-based**: No backend required - all data stored client-side

## Quick Start

### 1. Creating an Experiment

Navigate to `/admin/experiments` and click "Create Experiment":

```javascript
// Example experiment configuration
{
  name: "New Lesson Layout",
  description: "Testing a more engaging lesson layout",
  featureType: "lesson",
  targetMetric: "completion_rate",
  variants: [
    { id: "control", name: "Control", description: "Current layout" },
    { id: "variant-a", name: "Variant A", description: "New interactive layout" }
  ],
  audienceSplit: [50, 50] // 50% control, 50% variant A
}
```

### 2. Using Experiments in Components

#### Method 1: Using the `useExperiment` hook

```javascript
import React from 'react';
import { useExperiment } from '../hooks/useExperiment';

const LessonPage = ({ lesson }) => {
  const { variant, isInExperiment, trackEvent } = useExperiment('New Lesson Layout');

  // Track when user completes the lesson
  const handleLessonComplete = () => {
    if (isInExperiment) {
      trackEvent('lesson_completed', { lessonId: lesson.id });
    }
    // ... rest of completion logic
  };

  // Render different layouts based on variant
  if (variant === 'variant-a') {
    return <NewInteractiveLessonLayout lesson={lesson} onComplete={handleLessonComplete} />;
  }

  // Default/control variant
  return <OriginalLessonLayout lesson={lesson} onComplete={handleLessonComplete} />;
};
```

#### Method 2: Using the `useExperimentVariant` hook

```javascript
import React from 'react';
import { useExperimentVariant } from '../hooks/useExperiment';
import OriginalLessonLayout from './OriginalLessonLayout';
import NewInteractiveLessonLayout from './NewInteractiveLessonLayout';

const LessonPage = ({ lesson }) => {
  const Component = useExperimentVariant(
    'New Lesson Layout',
    {
      'control': OriginalLessonLayout,
      'variant-a': NewInteractiveLessonLayout
    },
    OriginalLessonLayout // Default if not in experiment
  );

  return <Component lesson={lesson} />;
};
```

### 3. Tracking Events

Track user actions to measure experiment success:

```javascript
import { useExperiment } from '../hooks/useExperiment';

const MyComponent = () => {
  const { trackEvent, isInExperiment } = useExperiment('My Experiment');

  const handleUserAction = () => {
    if (isInExperiment) {
      // Track different event types
      trackEvent('plan_completed', { planId: 123 });
      trackEvent('lesson_completed', { lessonId: 456 });
      trackEvent('conversion', { value: 1 });
      trackEvent('custom_event', { customData: 'value' });
    }
  };

  return <button onClick={handleUserAction}>Complete Action</button>;
};
```

### 4. Viewing Results

Navigate to `/admin/experiments` and click "Results" on any active or completed experiment to view:

- **Overview**: Variant performance, completion rates, statistical analysis
- **Event Log**: All tracked events with timestamps and metadata
- **Raw Data**: JSON export of experiment data

## Experiment Lifecycle

1. **Draft**: Experiment created but not yet started
   - Can edit configuration
   - Can delete
   - No user assignments yet

2. **Active**: Experiment is running
   - Users are automatically assigned to variants
   - Events are being tracked
   - Can pause or complete
   - Cannot edit configuration

3. **Paused**: Experiment temporarily stopped
   - No new user assignments
   - Can resume (return to Active)
   - Existing assignments remain

4. **Completed**: Experiment finished
   - Results are final
   - No new events tracked
   - Data preserved for analysis

## Metrics and Analysis

### Available Metrics

- **Completion Rate**: Percentage of users who complete the target action
- **Conversion Rate**: Percentage of users who convert
- **Retention**: User retention over time
- **Engagement**: User engagement levels
- **Time on Task**: Average time to complete actions

### Statistical Analysis

The framework calculates:

- **Z-Score**: Measure of statistical difference between variants
- **P-Value**: Probability that results are due to chance
- **Confidence**: Confidence level (shown as percentage)
- **Improvement**: Percentage improvement of variant vs control
- **Statistical Significance**: Results are significant if p < 0.05

## Best Practices

### 1. Experiment Design

- **Clear Hypothesis**: Know what you're testing and why
- **Single Variable**: Test one change at a time
- **Meaningful Sample Size**: Run experiments long enough to get statistical significance
- **Target Metric**: Choose the right metric for your hypothesis

### 2. Audience Split

- **Equal Split**: Use 50/50 for most experiments
- **Weighted Split**: Use 90/10 if testing risky changes
- **Multi-variant**: Test multiple variants with equal splits (33/33/33)

### 3. Event Tracking

```javascript
// Track key user actions
trackEvent('plan_completed', { planId, duration });
trackEvent('lesson_viewed', { lessonId, viewDuration });
trackEvent('conversion', { type: 'signup' });
trackEvent('engagement', { scrollDepth: 80 });
```

### 4. Running Experiments

- **Duration**: Run for at least 1-2 weeks or until statistical significance
- **Sample Size**: Need at least 100 users per variant for reliable results
- **Monitor**: Check results regularly but don't stop too early
- **Document**: Record learnings and decisions

## Example: Complete Onboarding Experiment

```javascript
// 1. Create experiment in admin panel
const experiment = {
  name: "Simplified Onboarding",
  description: "Testing a shorter 3-step onboarding vs current 5-step",
  featureType: "onboarding",
  targetMetric: "completion_rate",
  variants: [
    { id: "control", name: "5-Step Onboarding" },
    { id: "simplified", name: "3-Step Onboarding" }
  ],
  audienceSplit: [50, 50]
};

// 2. Implement in component
import { useExperiment } from '../hooks/useExperiment';

const OnboardingFlow = () => {
  const { variant, trackEvent } = useExperiment('Simplified Onboarding');

  const handleComplete = () => {
    trackEvent('conversion', { completedOnboarding: true });
  };

  const handleStep = (stepNumber) => {
    trackEvent('step_completed', { step: stepNumber });
  };

  if (variant === 'simplified') {
    return (
      <SimplifiedOnboarding
        onComplete={handleComplete}
        onStepComplete={handleStep}
      />
    );
  }

  return (
    <OriginalOnboarding
      onComplete={handleComplete}
      onStepComplete={handleStep}
    />
  );
};

// 3. Track additional metrics
const handleUserEngagement = (action) => {
  trackEvent('engagement', { action, timestamp: Date.now() });
};

// 4. Analyze results in dashboard
// Navigate to /admin/experiments/[experiment-id]/results
```

## Integration with Existing Features

### With StreakContext

```javascript
import { useStreak } from '../contexts/StreakContext';
import { useExperiment } from '../hooks/useExperiment';

const ActivityLogger = () => {
  const { logActivity } = useStreak();
  const { trackEvent } = useExperiment('Activity Tracking Enhancement');

  const handleActivity = (activityType) => {
    // Log to streak system
    logActivity(activityType);

    // Track for experiment
    trackEvent('plan_completed', { activityType });
  };

  return <button onClick={() => handleActivity('lesson_completed')}>Complete Lesson</button>;
};
```

### With LessonContext

```javascript
import { useLesson } from '../contexts/LessonContext';
import { useExperiment } from '../hooks/useExperiment';

const LessonViewer = ({ lessonId }) => {
  const { getLessonById } = useLesson();
  const { variant, trackEvent } = useExperiment('Enhanced Lesson Viewer');

  const lesson = getLessonById(lessonId);

  useEffect(() => {
    // Track lesson view
    trackEvent('lesson_viewed', { lessonId, timestamp: Date.now() });
  }, [lessonId]);

  if (variant === 'enhanced') {
    return <EnhancedLessonView lesson={lesson} />;
  }

  return <StandardLessonView lesson={lesson} />;
};
```

## API Reference

### ABTestContext

```javascript
import { useABTest } from '../contexts/ABTestContext';

const {
  experiments,           // Array of all experiments
  userAssignments,       // Object mapping experiment IDs to variant IDs
  experimentEvents,      // Array of all tracked events
  userId,                // Current user's ID
  createExperiment,      // (experimentData) => experiment
  updateExperiment,      // (experimentId, updates) => void
  deleteExperiment,      // (experimentId) => void
  startExperiment,       // (experimentId) => void
  pauseExperiment,       // (experimentId) => void
  completeExperiment,    // (experimentId) => void
  getVariant,            // (experimentId) => variantId
  trackEvent,            // (experimentId, variant, eventType, metadata) => event
  getExperimentEvents,   // (experimentId) => events[]
  calculateResults,      // (experimentId) => results
  getExperiment,         // (experimentId) => experiment
  getActiveExperiments   // () => experiments[]
} = useABTest();
```

### useExperiment Hook

```javascript
import { useExperiment } from '../hooks/useExperiment';

const {
  variant,         // Current variant ID (e.g., 'control', 'variant-a')
  isInExperiment,  // Boolean - is user in an active experiment?
  experimentId,    // Current experiment ID
  trackEvent       // (eventType, metadata) => void
} = useExperiment('Experiment Name');
```

## Data Storage

All experiment data is stored in localStorage:

- `ab-experiments`: Array of experiment configurations
- `ab-user-assignments`: User variant assignments
- `ab-experiment-events`: All tracked events
- `ab-user-id`: Persistent user identifier

## Troubleshooting

### Users not being assigned to variants

- Ensure experiment status is "Active"
- Check that experiment name matches exactly
- Verify ABTestProvider is wrapping your app in index.js

### Events not tracking

- Confirm experiment is active
- Check that `isInExperiment` is true before tracking
- Verify event is being called after user assignment

### Results not showing

- Ensure events have been tracked
- Check that experiment has run long enough
- Verify event types match expected types (plan_completed, lesson_completed, etc.)

## Future Enhancements

Potential improvements to consider:

1. **Backend Integration**: Move to API-based storage for multi-device support
2. **Advanced Analytics**: Add funnel analysis, cohort analysis
3. **Automated Stopping**: Auto-complete experiments when significance reached
4. **Targeting**: Segment experiments by user attributes
5. **Multivariate Testing**: Test multiple variables simultaneously
6. **Export/Import**: Export results to CSV, import experiment configs

## Support

For questions or issues with the A/B testing framework, please refer to this guide or check the implementation in:

- `/src/contexts/ABTestContext.js` - Core context
- `/src/hooks/useExperiment.js` - React hooks
- `/src/pages/ExperimentAdminPage.js` - Admin interface
- `/src/pages/ExperimentResultsPage.js` - Results dashboard
