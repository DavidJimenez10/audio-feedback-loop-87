
import { Card } from "./ui/card";
import { FeedbackDisplay } from "./audio/FeedbackDisplay";
import { AnalysisResult } from "./audio/AnalysisResult";
import { useSalesAnalysis } from "../hooks/use-sales-analysis";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { useAudioRecorderState } from "../hooks/use-audio-recorder-state";
import { useAudioUpload } from "./audio/hooks/useAudioUpload";
import { UploadTab } from "./audio/UploadTab";
import { RecordTab } from "./audio/RecordTab";

export const AudioFeedback = () => {
  const { feedback, setFeedback } = useSalesAnalysis();
  const {
    state,
    setters,
    refs,
    toast
  } = useAudioRecorderState();

  const {
    progressValue,
    isProcessing,
    processingTimeLeft,
    analysisResult,
    setIsProcessing,
    setProgressValue,
    handleFileUpload
  } = useAudioUpload();

  const cancelProcessing = () => {
    if (refs.processingInterval.current) clearInterval(refs.processingInterval.current);
    setIsProcessing(false);
    setProgressValue(0);
    toast({
      title: "Procesamiento cancelado",
      description: "Se ha cancelado el procesamiento del audio",
    });
  };

  const handleDownloadPDF = () => {
    toast({
      title: "Descargando PDF",
      description: "Iniciando descarga del análisis...",
    });
  };

  return (
    <Card className="p-6 max-w-3xl mx-auto mt-10 shadow-lg bg-white dark:bg-gray-800">
      <h2 className="text-2xl font-semibold mb-6 text-center">Subir Archivo de Audio</h2>
      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="upload">Subir Archivo</TabsTrigger>
          <TabsTrigger value="record">Grabar Audio</TabsTrigger>
        </TabsList>
        <TabsContent value="upload">
          <UploadTab 
            onFileUpload={handleFileUpload}
            progressValue={progressValue}
            isProcessing={isProcessing}
            processingTimeLeft={processingTimeLeft}
            onCancelProcessing={cancelProcessing}
          />
        </TabsContent>
        <TabsContent value="record">
          <RecordTab 
            isRecording={state.isRecording}
            onToggleRecording={state.isRecording ? state.handleStopRecording : state.handleStartRecording}
            progressValue={state.progressValue}
            recordingTime={state.recordingTime}
            isProcessing={isProcessing}
            processingTimeLeft={processingTimeLeft}
            onCancelProcessing={cancelProcessing}
          />
        </TabsContent>
      </Tabs>

      {feedback.message && (
        <div className="mt-6">
          <FeedbackDisplay 
            type={feedback.type}
            message={feedback.message}
            stage={feedback.stage}
          />
        </div>
      )}

      {analysisResult && (
        <div className="mt-6">
          <AnalysisResult
            filename={analysisResult}
            onDownload={handleDownloadPDF}
          />
        </div>
      )}
    </Card>
  );
};
