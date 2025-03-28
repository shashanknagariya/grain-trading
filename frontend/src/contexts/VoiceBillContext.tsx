import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import axios from 'axios';
import { useNotification } from './NotificationContext';
import { useTranslation } from 'react-i18next';

interface VoiceBillState {
  isRecording: boolean;
  duration: number;
  audioBlob: Blob | null;
  processing: boolean;
  intermediateBill: any | null;
  error: string | null;
}

type VoiceBillAction =
  | { type: 'START_RECORDING' }
  | { type: 'STOP_RECORDING'; payload: Blob }
  | { type: 'UPDATE_DURATION'; payload: number }
  | { type: 'START_PROCESSING' }
  | { type: 'PROCESS_SUCCESS'; payload: any }
  | { type: 'PROCESS_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'RESET_STATE' };

const initialState: VoiceBillState = {
  isRecording: false,
  duration: 0,
  audioBlob: null,
  processing: false,
  intermediateBill: null,
  error: null,
};

const voiceBillReducer = (state: VoiceBillState, action: VoiceBillAction): VoiceBillState => {
  switch (action.type) {
    case 'START_RECORDING':
      return {
        ...state,
        isRecording: true,
        duration: 0,
        audioBlob: null,
        error: null,
      };
    case 'STOP_RECORDING':
      return {
        ...state,
        isRecording: false,
        audioBlob: action.payload,
      };
    case 'UPDATE_DURATION':
      return {
        ...state,
        duration: action.payload,
      };
    case 'START_PROCESSING':
      return {
        ...state,
        processing: true,
        error: null,
      };
    case 'PROCESS_SUCCESS':
      return {
        ...state,
        processing: false,
        intermediateBill: action.payload,
      };
    case 'PROCESS_ERROR':
      return {
        ...state,
        processing: false,
        error: action.payload,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'RESET_STATE':
      return initialState;
    default:
      return state;
  }
};

interface VoiceBillContextType {
  state: VoiceBillState;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  processRecording: (billType: 'purchase' | 'sale') => Promise<void>;
  deleteIntermediateBill: (billId: number) => Promise<void>;
  approveIntermediateBill: (billId: number) => Promise<void>;
  resetState: () => void;
}

const VoiceBillContext = createContext<VoiceBillContextType | undefined>(undefined);

export const VoiceBillProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(voiceBillReducer, initialState);
  const { showSuccess, showError } = useNotification();
  const { t } = useTranslation();

  let mediaRecorder: MediaRecorder | null = null;
  let recordingTimer: NodeJS.Timeout | null = null;
  const chunks: Blob[] = [];

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder = new MediaRecorder(stream);
      chunks.length = 0;

      mediaRecorder.ondataavailable = (e) => {
        chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: 'audio/wav' });
        dispatch({ type: 'STOP_RECORDING', payload: audioBlob });
      };

      mediaRecorder.start();
      dispatch({ type: 'START_RECORDING' });

      // Start duration timer
      let duration = 0;
      recordingTimer = setInterval(() => {
        duration += 1;
        dispatch({ type: 'UPDATE_DURATION', payload: duration });
        if (duration >= 60) { // 1 minute limit
          stopRecording();
        }
      }, 1000);

    } catch (error) {
      showError(t('voice.errors.microphone_access'));
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
    }
    if (recordingTimer) {
      clearInterval(recordingTimer);
    }
  };

  const processRecording = async (billType: 'purchase' | 'sale') => {
    if (!state.audioBlob) return;

    dispatch({ type: 'START_PROCESSING' });
    const formData = new FormData();
    formData.append('audio', state.audioBlob);
    formData.append('bill_type', billType);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/voice-bills`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      dispatch({ type: 'PROCESS_SUCCESS', payload: response.data });
    } catch (error: any) {
      dispatch({ type: 'PROCESS_ERROR', payload: error.response?.data?.error || t('voice.errors.processing') });
      showError(t('voice.errors.processing'));
    }
  };

  const deleteIntermediateBill = async (billId: number) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/voice-bills/${billId}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      dispatch({ type: 'RESET_STATE' });
      showSuccess(t('voice.delete_success'));
    } catch (error) {
      showError(t('voice.errors.delete'));
    }
  };

  const approveIntermediateBill = async (billId: number) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/voice-bills/${billId}/approve`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      dispatch({ type: 'RESET_STATE' });
      showSuccess(t('voice.approve_success'));
      return response.data;
    } catch (error) {
      showError(t('voice.errors.approve'));
      throw error;
    }
  };

  const resetState = () => {
    dispatch({ type: 'RESET_STATE' });
  };

  return (
    <VoiceBillContext.Provider
      value={{
        state,
        startRecording,
        stopRecording,
        processRecording,
        deleteIntermediateBill,
        approveIntermediateBill,
        resetState,
      }}
    >
      {children}
    </VoiceBillContext.Provider>
  );
};

export const useVoiceBill = () => {
  const context = useContext(VoiceBillContext);
  if (context === undefined) {
    throw new Error('useVoiceBill must be used within a VoiceBillProvider');
  }
  return context;
};
