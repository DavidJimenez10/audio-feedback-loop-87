
import { useEffect, useRef } from 'react';

interface EvaluationDisplayProps {
  htmlContent: string;
}

export const EvaluationDisplay = ({ htmlContent }: EvaluationDisplayProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (iframeRef.current) {
      const iframe = iframeRef.current;
      
      // Esperar a que el iframe esté listo
      iframe.onload = () => {
        // Acceder al documento del iframe y escribir el contenido
        if (iframe.contentDocument) {
          iframe.contentDocument.open();
          iframe.contentDocument.write(htmlContent);
          iframe.contentDocument.close();
        }
      };
      
      // Trigger inicial
      if (iframe.contentDocument) {
        iframe.contentDocument.open();
        iframe.contentDocument.write(htmlContent);
        iframe.contentDocument.close();
      }
    }
  }, [htmlContent]);

  return (
    <div className="w-full mt-6">
      <iframe
        ref={iframeRef}
        className="w-full min-h-[800px] border rounded-lg bg-white"
        title="Evaluación de llamada"
        sandbox="allow-same-origin allow-scripts"
      />
    </div>
  );
};
