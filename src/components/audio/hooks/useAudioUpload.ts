
import { useState } from "react";
import { uploadToSupabase, sendToMakeWebhook } from "../../../utils/uploadUtils";
import { useSalesAnalysis } from "../../../hooks/use-sales-analysis";
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
        stage: 1
      });

      const audioBlob = new Blob([file], { type: file.type });
      const publicUrl = await uploadToSupabase(audioBlob);

      if (!publicUrl) {
        throw new Error('Error al obtener la URL pública');
      }

      setFeedback({
        type: "positive",
        message: "¡Archivo subido! ⚙️",
        stage: 2
      });

      const webhookSuccess = await sendToMakeWebhook(publicUrl);
      
      if (!webhookSuccess) {
        throw new Error('Error al procesar');
      }

      setFeedback({
        type: "positive",
        message: "¡Procesado! 🎉",
        stage: 3
      });

    } catch (error) {
      console.error("Error:", error);
      setProgressValue(0);
      setFeedback({
        type: "negative",
        message: "Error ❌",
        stage: 1
      });
      toast({
        title: "Error",
        description: "Error al procesar el audio",
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
