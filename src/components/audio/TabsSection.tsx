
import { TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import { UploadButton } from "./UploadButton";
import { RecordingControls } from "./RecordingControls";

interface TabsSectionProps {
  isRecording: boolean;
  onToggleRecording: () => void;
  progressValue: number;
  recordingTime: number;
  onFileUpload: (file: File) => void;
}

export const TabsSection = ({
  isRecording,
  onToggleRecording,
  progressValue,
  recordingTime,
  onFileUpload
}: TabsSectionProps) => {
  return (
    <>
      <TabsList className="grid w-full grid-cols-2 mb-6">
        <TabsTrigger value="upload">Subir Archivo</TabsTrigger>
        <TabsTrigger value="record">Grabar Audio</TabsTrigger>
      </TabsList>
      <TabsContent value="upload">
        <UploadButton onFileUpload={onFileUpload} />
      </TabsContent>
      <TabsContent value="record">
        <RecordingControls 
          isRecording={isRecording}
          onToggleRecording={onToggleRecording}
          progressValue={progressValue}
          recordingTime={recordingTime}
        />
      </TabsContent>
    </>
  );
};
