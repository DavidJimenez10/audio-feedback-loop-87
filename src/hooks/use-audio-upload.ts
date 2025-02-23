
import { useState } from "react";
import { uploadToSupabase, sendToMakeWebhook } from "../utils/uploadUtils";
import { useSalesAnalysis } from "../hooks/use-sales-analysis";
import { startProgressAndTime, stopProgressAndTime, startProcessingCountdown } from "../utils/progressUtils";
import { useToast } from "@/hooks/use-toast";

export const useAudioUpload = () => {
  const { setFeedback } = useSalesAnalysis();
  const [progressValue, setProgressValue] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingTimeLeft, setProcessingTimeLeft] = useState(120);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const { toast } = useToast();
  
  const handleFileUpload = async (file: File) => {
    try {
      console.log('Iniciando proceso de carga de archivo:', {
        nombre: file.name,
        tipo: file.type,
        tamaño: file.size
      });

      setFeedback({
        type: "neutral",
        message: "Subiendo archivo de audio... 📤",
      });

      // Crear un Blob del archivo de audio
      const audioBlob = new Blob([file], { type: file.type });
      
      // Subir a Supabase y obtener la URL pública
      const publicUrl = await uploadToSupabase(audioBlob, (progress) => {
        setProgressValue(progress);
        setFeedback({
          type: "neutral",
          message: `Subiendo audio... ${progress}% 📤`,
        });
      });

      if (!publicUrl) {
        throw new Error('Error al obtener la URL pública de Supabase');
      }

      console.log('URL pública generada:', publicUrl);

      setFeedback({
        type: "positive",
        message: "Audio subido exitosamente, procesando... ⚙️",
      });

      // Enviar la URL al webhook de Make
      const webhookSuccess = await sendToMakeWebhook(publicUrl);
      
      if (!webhookSuccess) {
        throw new Error('Error al procesar en Make');
      }

      // Iniciar el contador de procesamiento
      startProcessingCountdown(
        setIsProcessing,
        setProcessingTimeLeft,
        { current: null },
        setAnalysisResult,
        toast
      );

      setFeedback({
        type: "positive",
        message: "¡Audio procesado correctamente! 🎉",
      });

      toast({
        title: "¡Éxito!",
        description: "Audio procesado correctamente",
      });

    } catch (error) {
      console.error("Error en el proceso de subida:", error);
      setProgressValue(0);
      setFeedback({
        type: "negative",
        message: "Error en el proceso ❌",
      });
      toast({
        title: "Error",
        description: "Error al procesar el archivo de audio",
        variant: "destructive",
      });
    }
  };

  return {
    progressValue,
    isProcessing,
    processingTimeLeft,
    analysisResult,
    setIsProcessing,
    setProgressValue,
    setProcessingTimeLeft,
    handleFileUpload,
  };
};

