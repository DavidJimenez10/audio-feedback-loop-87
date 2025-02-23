
import { UploadButton } from "./UploadButton";
import { ProgressIndicator } from "./ProgressIndicator";
import { ProcessingCountdown } from "./ProcessingCountdown";

interface UploadTabProps {
  onFileUpload: (file: File) => void;
  progressValue: number;
  isProcessing: boolean;
  processingTimeLeft: number;
  onCancelProcessing: () => void;
}

export const UploadTab = ({
  onFileUpload,
  progressValue,
  isProcessing,
  processingTimeLeft,
  onCancelProcessing,
}: UploadTabProps) => {
  return (
    <div className="space-y-6">
      <UploadButton onFileUpload={onFileUpload} />
      {progressValue > 0 && !isProcessing && (
        <ProgressIndicator value={progressValue} />
      )}
      {isProcessing && (
        <ProcessingCountdown 
          timeLeft={processingTimeLeft}
          onCancel={onCancelProcessing}
        />
      )}
    </div>
  );
};
