
import { Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";
import { useConversation } from "@11labs/react";
import { useToast } from "@/hooks/use-toast";
import { sendToMakeWebhook } from "@/utils/uploadUtils";
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { EvaluationDisplay } from "../audio/EvaluationDisplay";

interface PricingCardProps {
  name: string;
  price: string;
  description: string;
  features: string[];
  icon: LucideIcon;
  buttonText: string;
  buttonColor: string;
  planType: string;
  recommended?: boolean;
  onSelect: (planType: string) => void;
}

export const PricingCard = ({
  name,
  price,
  description,
  features,
  icon: Icon,
  buttonText,
  buttonColor,
  planType,
  recommended,
  onSelect,
}: PricingCardProps) => {
  const [showEvaluation, setShowEvaluation] = useState(false);
  const [evaluationHtml, setEvaluationHtml] = useState<string | null>(null);
  const { toast } = useToast();
  
  const conversation = useConversation({
    onMessage: (message) => {
      console.log("Mensaje recibido:", message);
    },
    onError: (error) => {
      console.error("Error en la conversación:", error);
      toast({
        title: "Error",
        description: "Error en la conversación con el agente",
        variant: "destructive",
      });
    },
    onConnect: () => {
      console.log("Conexión establecida");
    },
  });

  const handleClick = async () => {
    try {
      // Primero, intentar obtener permiso del micrófono
      console.log("Solicitando permiso del micrófono...");
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true,
        video: false
      });

      // Si llegamos aquí, tenemos permiso del micrófono
      console.log("Permiso del micrófono concedido");

      // Iniciar la sesión con ElevenLabs
      console.log("Iniciando sesión con ElevenLabs...");
      const sessionData = await conversation.startSession({
        agentId: "0gLnzcbTHPrgMkiYcNFr" // ID del agente de ElevenLabs
      });

      if (!sessionData) {
        throw new Error('No se pudo iniciar la sesión con ElevenLabs');
      }

      console.log("Sesión iniciada correctamente:", sessionData);

      // Enviar al webhook
      const webhookResponse = await sendToMakeWebhook(sessionData, true);
      
      if (!webhookResponse) {
        throw new Error('Error al enviar al webhook');
      }

      // Llamar al callback proporcionado
      onSelect(planType);

      // Detener el stream del micrófono si ya no se necesita
      stream.getTracks().forEach(track => track.stop());

      toast({
        title: "¡Éxito!",
        description: "Conversación iniciada correctamente",
      });

    } catch (error) {
      console.error('Error detallado:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al iniciar la conversación",
        variant: "destructive",
      });

      // Asegurarse de que el stream se detenga en caso de error
      try {
        const tracks = await navigator.mediaDevices.getUserMedia({ audio: true });
        tracks.getTracks().forEach(track => track.stop());
      } catch (e) {
        console.error('Error al limpiar el stream:', e);
      }
    }
  };

  return (
    <>
      <Card 
        className={`relative p-8 bg-[#1a1f2e] border-0 shadow-xl transition-all duration-300 hover:transform hover:scale-105 hover:shadow-2xl ${
          recommended ? 'ring-2 ring-green-500' : ''
        }`}
      >
        {recommended && (
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
            <span className="inline-block bg-gradient-to-r from-green-400 to-green-500 text-white px-4 py-1 text-sm font-semibold rounded-full shadow-lg">
              Recomendado
            </span>
          </div>
        )}
        
        <div className="text-center">
          <div className="h-12 w-12 mx-auto mb-4 bg-gradient-to-br from-blue-400/20 to-blue-600/20 rounded-full flex items-center justify-center">
            <Icon className="h-6 w-6 text-blue-500" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">{name}</h3>
          <div className="mb-4">
            <span className="text-4xl font-bold text-white">${price}</span>
            {name !== "Pro" && <span className="text-gray-400">/mes</span>}
          </div>
          <p className="text-gray-400 mb-6">{description}</p>
        </div>

        <ul className="space-y-4 mb-8">
          {features.map((feature) => (
            <li key={feature} className="flex items-start text-gray-300">
              <Check className="h-5 w-5 text-green-500 mr-2 mt-1 flex-shrink-0" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        <Button 
          className={`w-full py-6 text-lg font-semibold text-white transition-all duration-300 ${buttonColor} shadow-lg hover:shadow-xl`}
          onClick={handleClick}
        >
          {buttonText}
        </Button>
      </Card>

      <Dialog open={showEvaluation} onOpenChange={setShowEvaluation}>
        <DialogContent className="sm:max-w-4xl h-[80vh]">
          {evaluationHtml && (
            <EvaluationDisplay htmlContent={evaluationHtml} />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
