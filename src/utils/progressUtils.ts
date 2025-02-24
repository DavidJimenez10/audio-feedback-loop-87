
import { SalesAnalysis } from "@/types/sales";

export const startProcessingCountdown = (
  setIsProcessing: (value: boolean) => void,
  setProcessingTimeLeft: React.Dispatch<React.SetStateAction<number>>,
  processingInterval: React.MutableRefObject<NodeJS.Timeout | undefined>,
  setResult: (result: any) => void,
  toast: any
) => {
  console.log('🚀 Iniciando procesamiento del audio...');
  setIsProcessing(true);
  setProcessingTimeLeft(120);

  // Simular espera y chequear resultado
  const checkResult = async () => {
    try {
      console.log('📡 Haciendo petición al webhook...');
      const response = await fetch('https://hook.us2.make.com/fdfea2uux2sa7todteplybdudo45qpwm');
      
      if (!response.ok) {
        console.error('❌ Error en la respuesta del webhook:', response.status);
        throw new Error('Error al obtener el resultado');
      }

      const responseData = await response.json();
      console.log('✅ Respuesta del webhook recibida:', responseData);
      
      if (responseData) {
        console.log('🎯 Procesando respuesta del webhook');
        if (processingInterval.current) {
          console.log('⏱️ Limpiando intervalo de procesamiento');
          clearInterval(processingInterval.current);
        }
        setIsProcessing(false);
        
        // Procesar diferentes tipos de respuesta
        if (responseData.output && typeof responseData.output === 'string' && responseData.output.includes('<!DOCTYPE html>')) {
          console.log('🎯 Se encontró contenido HTML en la respuesta');
          setResult(responseData.output);
        } else if (responseData.analysis) {
          console.log('📊 Se encontró análisis en la respuesta:', responseData.analysis);
          setResult(responseData.analysis);
        } else if (responseData.pdfUrl) {
          console.log('📄 Se encontró URL de PDF en la respuesta:', responseData.pdfUrl);
          setResult({ type: 'pdf', url: responseData.pdfUrl });
        }
        
        toast({
          title: "¡Análisis completado!",
          description: "Se ha generado el análisis de la llamada",
          variant: "success",
        });
        
        return true;
      }
      console.log('⏳ No hay resultado todavía, continuando...');
      return false;
    } catch (error) {
      console.error('❌ Error al obtener resultado:', error);
      return false;
    }
  };

  let attempts = 0;
  processingInterval.current = setInterval(async () => {
    attempts++;
    console.log(`🔄 Intento ${attempts} de obtener resultado...`);
    
    setProcessingTimeLeft((prev) => {
      if (prev <= 1) {
        console.log('⚠️ Tiempo agotado');
        if (processingInterval.current) {
          clearInterval(processingInterval.current);
        }
        setIsProcessing(false);
        toast({
          title: "Tiempo agotado",
          description: "No se pudo obtener el resultado en el tiempo esperado",
          variant: "destructive",
        });
        return 0;
      }
      return prev - 1;
    });

    const success = await checkResult();
    if (success || attempts >= 120) {
      if (processingInterval.current) {
        clearInterval(processingInterval.current);
      }
      if (!success && attempts >= 120) {
        console.log('❌ Se alcanzó el máximo de intentos');
        setIsProcessing(false);
        toast({
          title: "Tiempo agotado",
          description: "No se pudo obtener el resultado en el tiempo esperado",
          variant: "destructive",
        });
      }
    }
  }, 1000);
};

export const startProgressAndTime = (
  setProgressValue: (value: number) => void,
  setRecordingTime: (value: number) => void,
  progressInterval: React.MutableRefObject<NodeJS.Timeout | undefined>,
  timeInterval: React.MutableRefObject<NodeJS.Timeout | undefined>
) => {
  setProgressValue(0);
  setRecordingTime(0);

  let progress = 0;
  progressInterval.current = setInterval(() => {
    progress += 1;
    setProgressValue(progress);

    if (progress >= 100) {
      clearInterval(progressInterval.current);
    }
  }, 500);

  let time = 0;
  timeInterval.current = setInterval(() => {
    time += 1;
    setRecordingTime(time);
  }, 1000);
};

export const stopProgressAndTime = (
  progressInterval: React.MutableRefObject<NodeJS.Timeout | undefined>,
  timeInterval: React.MutableRefObject<NodeJS.Timeout | undefined>,
  setProgressValue: (value: number) => void
) => {
  if (progressInterval.current) clearInterval(progressInterval.current);
  if (timeInterval.current) clearInterval(timeInterval.current);
  setProgressValue(0);
};
