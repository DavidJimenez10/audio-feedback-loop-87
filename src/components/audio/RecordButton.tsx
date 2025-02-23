
import { Button } from "../ui/button";
import { Mic, Square } from "lucide-react";
import { useState, useEffect } from "react";
import { useAudioRecorderState } from "@/hooks/use-audio-recorder-state";
import { uploadToSupabase, sendToMakeWebhook } from "@/utils/uploadUtils";
import { useSalesAnalysis } from "@/hooks/use-sales-analysis";
import { toast } from "@/hooks/use-toast";

interface RecordButtonProps {
  isRecording: boolean;
  onToggleRecording: () => void;
}

export const RecordButton = ({ isRecording, onToggleRecording }: RecordButtonProps) => {
  const { setFeedback } = useSalesAnalysis();
  const { 
    state: { mediaRecorderRef, audioChunksRef },
  } = useAudioRecorderState();

  useEffect(() => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.onstop = async () => {
        try {
          setFeedback({
            type: "neutral",
            message: "Procesando grabación... ⚙️",
          });

          // Consolidar los chunks de audio en un blob
          const audioBlob = new Blob(audioChunksRef.current, {
            type: 'audio/webm'
          });

          // Subir a Supabase
          const publicUrl = await uploadToSupabase(audioBlob, (progress) => {
            setFeedback({
              type: "neutral",
              message: `Subiendo audio... ${progress}% 📤`,
            });
          });

          if (!publicUrl) {
            throw new Error('Error al obtener la URL pública');
          }

          setFeedback({
            type: "positive",
            message: "Audio grabado exitosamente, procesando... ⚙️",
          });

          // Enviar al webhook de Make
          const webhookSuccess = await sendToMakeWebhook(publicUrl);
          
          if (!webhookSuccess) {
            throw new Error('Error al procesar en Make');
          }

          setFeedback({
            type: "positive",
            message: "¡Grabación procesada correctamente! 🎉",
          });

          toast({
            title: "¡Éxito!",
            description: "Grabación procesada correctamente",
          });

        } catch (error) {
          console.error('Error en el proceso de grabación:', error);
          setFeedback({
            type: "negative",
            message: "Error en el proceso ❌",
          });
          toast({
            title: "Error",
            description: "No se pudo procesar la grabación",
            variant: "destructive",
          });
        }
      };
    }
  }, [mediaRecorderRef, audioChunksRef, setFeedback]);

  return (
    <Button
      onClick={onToggleRecording}
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
  );
};

