
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

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      timeInterval.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Error",
        description: "No se pudo iniciar la grabación. Por favor verifica los permisos del micrófono.",
        variant: "destructive",
      });
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timeInterval.current) {
        clearInterval(timeInterval.current);
      }

      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

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
      handleStartRecording,
      handleStopRecording,
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

