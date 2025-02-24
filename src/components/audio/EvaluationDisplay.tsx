
import { useEffect, useRef } from 'react';

interface EvaluationDisplayProps {
  htmlContent: string;
}

export const EvaluationDisplay = ({ htmlContent }: EvaluationDisplayProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (iframeRef.current && htmlContent) {
      const iframe = iframeRef.current;
      
      const writeContent = () => {
        if (iframe.contentDocument) {
          // Limpiar el contenido anterior
          iframe.contentDocument.open();
          
          // Asegurarnos de que el HTML incluya los meta tags necesarios
          const formattedHtml = htmlContent.includes('<!DOCTYPE html>') 
            ? htmlContent 
            : `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body>${htmlContent}</body></html>`;

          // Escribir el nuevo contenido HTML
          iframe.contentDocument.write(formattedHtml);
          iframe.contentDocument.close();

          // Asegurarnos de que los estilos se apliquen correctamente
          const iframeBody = iframe.contentDocument.body;
          if (iframeBody) {
            iframeBody.style.margin = '0';
            iframeBody.style.padding = '0';
          }

          // Ajustar la altura del iframe al contenido
          const updateIframeHeight = () => {
            if (iframe.contentDocument?.body) {
              const height = iframe.contentDocument.body.scrollHeight;
              iframe.style.height = `${height}px`;
            }
          };

          // Intentar ajustar la altura después de que el contenido se cargue
          setTimeout(updateIframeHeight, 100);
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
        className="w-full border rounded-lg bg-white"
        style={{ minHeight: '600px' }}
        title="Evaluación de llamada"
        sandbox="allow-same-origin allow-scripts"
      />
    </div>
  );
};
