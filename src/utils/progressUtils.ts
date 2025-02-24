
export const startProgressAndTime = (
  setProgressValue: (value: number) => void,
  setRecordingTime: (value: number) => void,
  progressInterval: { current: NodeJS.Timeout | undefined },
  timeInterval: { current: NodeJS.Timeout | undefined }
) => {
  setProgressValue(0);
  setRecordingTime(0);
  
  let currentProgress = 0;
  progressInterval.current = setInterval(() => {
    currentProgress += 1;
    if (currentProgress <= 100) {
      setProgressValue(currentProgress);
    } else {
      clearInterval(progressInterval.current);
      setProgressValue(100);
    }
  }, 100);

  let currentTime = 0;
  timeInterval.current = setInterval(() => {
    currentTime += 1;
    setRecordingTime(currentTime);
  }, 1000);
};

export const stopProgressAndTime = (
  progressInterval: { current: NodeJS.Timeout | undefined },
  timeInterval: { current: NodeJS.Timeout | undefined },
  setProgressValue: (value: number) => void
) => {
  if (progressInterval.current) clearInterval(progressInterval.current);
  if (timeInterval.current) clearInterval(timeInterval.current);
  setProgressValue(100);
};

export const startProcessingCountdown = (
  setIsProcessing: (value: boolean) => void,
  setProcessingTimeLeft: (value: number) => void,
  processingInterval: { current: NodeJS.Timeout | undefined },
  setAnalysisResult: (value: string | null) => void,
  toast: any
) => {
  setIsProcessing(true);
  setProcessingTimeLeft(120);

  let timeLeft = 120;
  processingInterval.current = setInterval(() => {
    timeLeft -= 1;
    if (timeLeft <= 0) {
      clearInterval(processingInterval.current);
      setIsProcessing(false);
      setAnalysisResult("analysis_result.pdf");
      toast({
        title: "¡Análisis completado!",
        description: "PDF generado y listo para descargar ✅",
      });
      setProcessingTimeLeft(0);
    } else {
      setProcessingTimeLeft(timeLeft);
    }
  }, 1000);
};
