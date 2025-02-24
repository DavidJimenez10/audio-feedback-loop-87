
import { useState, useRef, useEffect } from "react";
import { uploadToSupabase, sendToMakeWebhook } from "../utils/uploadUtils";
import { useToast } from "./use-toast";

export const useAudioRecorderState = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [progressValue, setProgressValue] = useState(0);
  const [recordingTime, setRecordingTime] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingTimeLeft, setProcessingTimeLeft] = useState(120);
  const progressInterval = useRef<NodeJS.Timeout>();
  const timeInterval = useRef<NodeJS.Timeout>();
  const processingInterval = useRef<NodeJS.Timeout>();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
      if (timeInterval.current) clearInterval(timeInterval.current);
      if (processingInterval.current) clearInterval(processingInterval.current);
    };
  }, []);

  return {
    state: {
      isRecording,
      progressValue,
      recordingTime,
      analysisResult,
      isProcessing,
      processingTimeLeft,
      mediaRecorderRef,
      audioChunksRef,
    },
    setters: {
      setIsRecording,
      setProgressValue,
      setRecordingTime,
      setAnalysisResult,
      setIsProcessing,
      setProcessingTimeLeft,
    },
    refs: {
      progressInterval,
      timeInterval,
      processingInterval,
    },
    toast,
  };
};
