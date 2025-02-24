
import { useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog"

interface EvaluationDisplayProps {
  htmlContent: string;
  isOpen: boolean;
  onClose: () => void;
}

export const EvaluationDisplay = ({ htmlContent, isOpen, onClose }: EvaluationDisplayProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (iframeRef.current && htmlContent) {
      const iframe = iframeRef.current;
      iframe.srcdoc = htmlContent;
    }
  }, [htmlContent]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[90vw]">
        <DialogHeader>
          <DialogTitle>Evaluación de llamada</DialogTitle>
        </DialogHeader>
        <div className="w-full">
          <iframe
            ref={iframeRef}
            className="w-full min-h-[600px] border rounded-lg bg-white"
            title="Evaluación de llamada"
            sandbox="allow-same-origin allow-scripts"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

