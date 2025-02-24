
import { useEffect, useRef } from 'react';

interface EvaluationDisplayProps {
  htmlContent: string;
}

export const EvaluationDisplay = ({ htmlContent }: EvaluationDisplayProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (iframeRef.current && htmlContent) {
      const iframe = iframeRef.current;
      iframe.srcdoc = htmlContent;
    }
  }, [htmlContent]);

  return (
    <div className="w-full mt-6">
      <iframe
        ref={iframeRef}
        className="w-full min-h-[600px] border rounded-lg bg-white"
        title="Evaluación de llamada"
        sandbox="allow-same-origin allow-scripts"
      />
    </div>
  );
};
