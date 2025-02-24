
import { ProgressIndicator } from "./ProgressIndicator";
import { ProcessingCountdown } from "./ProcessingCountdown";

interface ProcessingSectionProps {
  progressValue: number;
  isProcessing: boolean;
  processingTimeLeft: number;
  onCancel: () => void;
}

export const ProcessingSection = ({
  progressValue,
  isProcessing,
  processingTimeLeft,
  onCancel
}: ProcessingSectionProps) => {
  return (
    <div className="mt-6 space-y-4">
      {progressValue < 100 && (
        <ProgressIndicator value={progressValue} />
      )}
      
      {isProcessing && (
        <ProcessingCountdown 
          timeLeft={processingTimeLeft}
          onCancel={onCancel}
        />
      )}
    </div>
  );
};
