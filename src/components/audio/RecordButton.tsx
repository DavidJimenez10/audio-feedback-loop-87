
import { Button } from "../ui/button";
import { Mic, Square } from "lucide-react";

interface RecordButtonProps {
  isRecording: boolean;
  onToggleRecording: () => void;
}

export const RecordButton = ({ isRecording, onToggleRecording }: RecordButtonProps) => {
  return (
    <Button
      onClick={onToggleRecording}
      variant={isRecording ? "destructive" : "default"}
      className={`w-16 h-16 rounded-full flex items-center justify-center ${
        isRecording ? "recording-pulse" : ""
      }`}
    >
      {isRecording ? (
        <Square className="w-6 h-6" />
      ) : (
        <Mic className="w-6 h-6" />
      )}
    </Button>
  );
};
