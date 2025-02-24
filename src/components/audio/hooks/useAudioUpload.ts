
import { useState } from "react";
import { uploadToSupabase, sendToMakeWebhook } from "../../../utils/uploadUtils";
import { useSalesAnalysis } from "../../../hooks/use-sales-analysis";
import { startProgressAndTime, stopProgressAndTime, startProcessingCountdown } from "../../../utils/progressUtils";
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
      setFeedback({
        type: "neutral",
        message: "Subiendo archivo... 📤",
      });
      
      const audioBlob = new Blob([file], { type: file.type });
      const publicUrl = await uploadToSupabase(audioBlob, (progress) => {
        setProgressValue(progress);
      });
      
      if (!publicUrl) {
        throw new Error('Error al obtener la URL pública');
      }

      setFeedback({
        type: "positive",
        message: "Archivo subido exitosamente, procesando... ⚙️",
      });

      const webhookSuccess = await sendToMakeWebhook(publicUrl);
      
      if (!webhookSuccess) {
        throw new Error('Error al procesar en Make');
      }
      
      startProcessingCountdown(
        setIsProcessing,
        setProcessingTimeLeft,
        { current: null },
        setAnalysisResult,
        toast
      );

      setFeedback({
        type: "positive",
        message: "¡Archivo procesado correctamente! 🎉",
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
        description: "Error al procesar el archivo ❌",
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
