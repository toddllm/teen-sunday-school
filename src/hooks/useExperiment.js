import { useEffect, useState } from 'react';
import { useABTest } from '../contexts/ABTestContext';

/**
 * Hook to use an experiment and get the assigned variant
 *
 * @param {string} experimentName - The name of the experiment to check
 * @returns {object} { variant, isInExperiment, trackEvent }
 *
 * @example
 * const { variant, isInExperiment, trackEvent } = useExperiment('New Lesson Layout');
 *
 * if (variant === 'variant-a') {
 *   // Show variant A
 *   return <NewLessonLayout />;
 * } else {
 *   // Show control
 *   return <OriginalLessonLayout />;
 * }
 *
 * // Track an event
 * trackEvent('lesson_completed', { lessonId: 123 });
 */
export const useExperiment = (experimentName) => {
  const { experiments, getVariant, trackEvent: trackABEvent } = useABTest();
  const [variant, setVariant] = useState(null);
  const [experimentId, setExperimentId] = useState(null);
  const [isInExperiment, setIsInExperiment] = useState(false);

  useEffect(() => {
    // Find active experiment by name
    const experiment = experiments.find(
      exp => exp.name === experimentName && exp.status === 'active'
    );

    if (experiment) {
      const assignedVariant = getVariant(experiment.id);
      setVariant(assignedVariant);
      setExperimentId(experiment.id);
      setIsInExperiment(true);
    } else {
      setVariant(null);
      setExperimentId(null);
      setIsInExperiment(false);
    }
  }, [experimentName, experiments, getVariant]);

  // Wrapper function to track events for this experiment
  const trackEvent = (eventType, metadata = {}) => {
    if (isInExperiment && experimentId) {
      trackABEvent(experimentId, variant, eventType, metadata);
    }
  };

  return {
    variant,
    isInExperiment,
    experimentId,
    trackEvent
  };
};

/**
 * Hook to conditionally render content based on experiment variant
 *
 * @param {string} experimentName - The name of the experiment
 * @param {object} variants - Object mapping variant IDs to React components or render functions
 * @param {React.Component} defaultComponent - Component to render if not in experiment
 * @returns {React.Component} The component to render
 *
 * @example
 * const LessonPage = () => {
 *   const Component = useExperimentVariant('New Lesson Layout', {
 *     'control': OriginalLessonLayout,
 *     'variant-a': NewLessonLayout
 *   }, OriginalLessonLayout);
 *
 *   return <Component />;
 * };
 */
export const useExperimentVariant = (experimentName, variants, defaultComponent) => {
  const { variant, isInExperiment } = useExperiment(experimentName);

  if (isInExperiment && variant && variants[variant]) {
    return variants[variant];
  }

  return defaultComponent;
};

export default useExperiment;
