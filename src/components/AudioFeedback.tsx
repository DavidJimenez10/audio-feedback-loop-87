
import { useEffect, useState, useRef } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { useToast } from "../hooks/use-toast";
import { Mic, Square, ThumbsUp, ThumbsDown, AlertCircle } from "lucide-react";
import { SalesAnalysis, SalesStage } from "../types/sales";
import { createClient } from '@supabase/supabase-js'

interface FeedbackState {
  type: "positive" | "neutral" | "negative";
  message: string;
  stage?: SalesStage;
  analysis?: Partial<SalesAnalysis>;
}

const CHUNK_SIZE = 10000; // 10 segundos en milisegundos

export const AudioFeedback = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState>({
    type: "neutral",
    message: "Listo 👋",
  });
  const { toast } = useToast();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [transcription, setTranscription] = useState("");

  const supabase = createClient(
    'https://vpvjfmxakuwphkcdsvze.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwdmpmbXhha3V3cGhrY2RzdnplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDk1OTY0NDcsImV4cCI6MjAyNTE3MjQ0N30.EkyRW6CNFKhyduYjCGL6I7NvyXxKwnbgUYQYBo1oL78'
  );

  const analyzeFeedback = (analysis: any) => {
    let feedbackState: FeedbackState = {
      type: "neutral",
      message: "Escuchando... 👂"
    };

    // Analiza la respuesta de Make/LLM
    if (analysis.confidence > 0.8) {
      feedbackState.type = "positive";
      feedbackState.message = `${analysis.recommendation} ✅`;
    } else {
      feedbackState.type = "neutral";
      feedbackState.message = `${analysis.recommendation} 🤔`;
    }

    if (analysis.stage) {
      feedbackState.stage = analysis.stage;
    }

    setFeedback(feedbackState);
  };

  const processAudioChunk = async (chunk: Blob) => {
    try {
      const base64Audio = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
        reader.readAsDataURL(chunk);
      });

      const { data, error } = await supabase.functions.invoke('transcribe-audio', {
        body: { audio: base64Audio }
      });

      if (error) throw error;

      if (data.text) {
        setTranscription(prev => `${prev} ${data.text}`);
      }

      if (data.analysis) {
        analyzeFeedback(data.analysis);
      }

    } catch (error) {
      console.error('Error processing audio:', error);
      toast({
        title: "Error",
        description: "Error al procesar el audio ❌",
        variant: "destructive",
      });
    }
  };

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
          processAudioChunk(e.data);
        }
      };

      mediaRecorder.start(CHUNK_SIZE);
      setIsRecording(true);
      setFeedback({
        type: "neutral",
        message: "Iniciando... 🎤",
      });

    } catch (error) {
      console.error("Error al acceder al micrófono:", error);
      toast({
        title: "Error",
        description: "No hay micrófono ❌",
        variant: "destructive",
      });
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
    setIsRecording(false);
    setTranscription("");
  };

  const getFeedbackColor = (type: FeedbackState["type"]) => {
    switch (type) {
      case "positive":
        return "bg-green-100 text-green-800";
      case "negative":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getFeedbackIcon = (type: FeedbackState["type"]) => {
    switch (type) {
      case "positive":
        return <ThumbsUp className="w-6 h-6" />;
      case "negative":
        return <ThumbsDown className="w-6 h-6" />;
      default:
        return <AlertCircle className="w-6 h-6" />;
    }
  };

  return (
    <Card className="p-6 max-w-md mx-auto mt-10 shadow-lg">
      <div className="space-y-6">
        <div className="flex justify-center">
          <Button
            onClick={isRecording ? handleStopRecording : handleStartRecording}
            variant={isRecording ? "destructive" : "default"}
            className={`w-16 h-16 rounded-full flex items-center justify-center ${
              isRecording ? "recording-pulse" : ""
            }`}
          >
            {isRecording ? (
              <Square className="w-6 h-6" />
            ) : (
              <Mic className="w-6 h-6" />
            )}
          </Button>
        </div>

        {transcription && (
          <div className="p-4 rounded-lg bg-gray-50">
            <p className="text-sm text-gray-600">Transcripción:</p>
            <p className="text-gray-800">{transcription}</p>
          </div>
        )}

        <div
          className={`p-4 rounded-lg feedback-transition ${getFeedbackColor(
            feedback.type
          )}`}
        >
          <div className="flex items-center justify-center space-x-2">
            {getFeedbackIcon(feedback.type)}
            <p className="text-center text-lg font-medium">{feedback.message}</p>
          </div>
          {feedback.stage && (
            <p className="text-center text-sm mt-2">
              Etapa {feedback.stage}
            </p>
          )}
        </div>

        {isRecording && (
          <div className="text-center text-sm text-gray-500">
            🎤 Grabando...
          </div>
        )}
      </div>
    </Card>
  );
};
