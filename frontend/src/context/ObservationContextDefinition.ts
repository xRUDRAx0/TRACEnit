import { createContext } from 'react';
import type { Socket } from 'socket.io-client';

export interface ObservationContextType {
  isActive: boolean;
  toggleObservation: () => Promise<void>;
  isLoading: boolean;
  liveEvents: any[];
  socket: Socket | null;
  currentSessionId: string | null;
  livePattern: any;
}

export const ObservationContext = createContext<ObservationContextType | undefined>(undefined);
