
import { RecordingControls } from "./RecordingControls";
import { ProgressIndicator } from "./ProgressIndicator";
import { ProcessingCountdown } from "./ProcessingCountdown";

interface RecordTabProps {
  isRecording: boolean;
  onToggleRecording: () => void;
  progressValue: number;
  recordingTime: number;
  isProcessing: boolean;
  processingTimeLeft: number;
  onCancelProcessing: () => void;
}

export const RecordTab = ({
  isRecording,
  onToggleRecording,
  progressValue,
  recordingTime,
  isProcessing,
  processingTimeLeft,
  onCancelProcessing,
}: RecordTabProps) => {
  return (
    <div className="space-y-6">
      <RecordingControls 
        isRecording={isRecording}
        onToggleRecording={onToggleRecording}
        progressValue={progressValue}
        recordingTime={recordingTime}
      />
      {isProcessing && (
        <ProcessingCountdown 
          timeLeft={processingTimeLeft}
          onCancel={onCancelProcessing}
        />
      )}
    </div>
  );
};
