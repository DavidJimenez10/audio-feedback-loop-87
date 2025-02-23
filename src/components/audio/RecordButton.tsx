
import { Button } from "../ui/button";
import { Mic, Square } from "lucide-react";
import { useState, useEffect } from "react";
import { useAudioRecorderState } from "@/hooks/use-audio-recorder-state";
import { uploadToSupabase, sendToMakeWebhook } from "@/utils/uploadUtils";
import { useSalesAnalysis } from "@/hooks/use-sales-analysis";
import { useToast } from "@/hooks/use-toast";

interface RecordButtonProps {
  isRecording: boolean;
  onToggleRecording: () => void;
}

export const RecordButton = ({ isRecording, onToggleRecording }: RecordButtonProps) => {
  const { setFeedback } = useSalesAnalysis();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const { 
    state: { mediaRecorderRef, audioChunksRef },
  } = useAudioRecorderState();

  useEffect(() => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.onstop = async () => {
        try {
          setIsUploading(true);
          setFeedback({
            type: "neutral",
            message: "Procesando grabación... ⚙️",
          });

          // Consolidar los chunks de audio en un blob
          const audioBlob = new Blob(audioChunksRef.current, {
            type: 'audio/webm'
          });

          console.log('Audio blob creado:', {
            tipo: audioBlob.type,
            tamaño: audioBlob.size
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

          console.log('URL pública generada:', publicUrl);

          setFeedback({
            type: "positive",
            message: "Audio grabado exitosamente, procesando... ⚙️",
          });

          // Enviar al webhook de Make
          const webhookSuccess = await sendToMakeWebhook(publicUrl);
          
          if (!webhookSuccess) {
            throw new Error('Error al procesar en Make');
          }

          console.log('Webhook enviado exitosamente');

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
        } finally {
          setIsUploading(false);
        }
      };
    }
  }, [mediaRecorderRef, audioChunksRef, setFeedback, toast]);

  return (
    <div className="flex flex-col items-center gap-4">
      <Button
        onClick={onToggleRecording}
        variant={isRecording ? "destructive" : "default"}
        className={`w-16 h-16 rounded-full flex items-center justify-center transition-transform ${
          isRecording ? "recording-pulse" : ""
        } ${isUploading ? 'scale-110 animate-pulse' : ''}`}
        disabled={isUploading}
      >
        {isRecording ? (
          <Square className="w-6 h-6" />
        ) : (
          <Mic className="w-6 h-6" />
        )}
      </Button>
      {isUploading && (
        <p className="text-sm text-gray-500 text-center mt-2">
          Procesando audio...
        </p>
      )}
    </div>
  );
};
