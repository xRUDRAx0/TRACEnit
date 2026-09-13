import { useContext } from 'react';
import { ObservationContext } from '../context/ObservationContextDefinition';

export function useObservation() {
  const context = useContext(ObservationContext);
  if (context === undefined) {
    throw new Error('useObservation must be used within an ObservationProvider');
  }
  return context;
}
