
import { useEffect, useRef } from 'react';

interface EvaluationDisplayProps {
  htmlContent: string;
}

export const EvaluationDisplay = ({ htmlContent }: EvaluationDisplayProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (iframeRef.current) {
      const iframe = iframeRef.current;
      
      // Asegurar que el contenido se escriba cuando el iframe esté listo
      const writeContent = () => {
        if (iframe.contentDocument) {
          // Limpiar el contenido anterior
          iframe.contentDocument.open();
          // Escribir el nuevo contenido HTML
          iframe.contentDocument.write(htmlContent);
          // Cerrar el documento para finalizar la escritura
          iframe.contentDocument.close();

          // Asegurarnos de que los estilos se apliquen correctamente
          const iframeBody = iframe.contentDocument.body;
          if (iframeBody) {
            iframeBody.style.margin = '0';
            iframeBody.style.padding = '0';
          }
        }
      };

      // Intentar escribir el contenido inmediatamente
      writeContent();

      // También intentar escribir cuando el iframe se cargue
      iframe.onload = writeContent;
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
