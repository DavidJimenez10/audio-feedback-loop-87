
import { useState } from "react";
import { uploadToSupabase, sendToMakeWebhook } from "../utils/uploadUtils";
import { useSalesAnalysis } from "./use-sales-analysis";
import { useToast } from "./use-toast";

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
        stage: 1
      });

      // Crear un Blob del archivo de audio
      const audioBlob = new Blob([file], { type: file.type });
      
      // Subir a Supabase y obtener la URL pública
      const publicUrl = await uploadToSupabase(audioBlob);

      if (!publicUrl) {
        throw new Error('Error al obtener la URL pública de Supabase');
      }

      setFeedback({
        type: "neutral",
        message: "Audio subido exitosamente, procesando... ⚙️",
        stage: 2
      });

      // Enviar la URL al webhook de Make
      const webhookSuccess = await sendToMakeWebhook(publicUrl);
      
      if (!webhookSuccess) {
        throw new Error('Error al procesar en Make');
      }

      setFeedback({
        type: "positive",
        message: "¡Audio procesado correctamente! 🎉",
        stage: 3
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
        stage: 1
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
