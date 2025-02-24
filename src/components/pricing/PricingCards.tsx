import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useConversation } from "@11labs/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage } from "../chat/ChatMessage";
import { UploadButton } from "../audio/UploadButton";
import { RecordButton } from "../audio/RecordButton";
import { ProcessingCountdown } from "../audio/ProcessingCountdown";
import { plans, PLAN_HANDLERS } from "@/config/planConfig";
import { PricingCard } from "./PricingCard";

export const PricingCards = () => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isAgentModalOpen, setIsAgentModalOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [progressValue, setProgressValue] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingTimeLeft, setProcessingTimeLeft] = useState(120);
  const processingInterval = useRef<NodeJS.Timeout>();
  const [pdfReady, setPdfReady] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const { toast } = useToast();
  
  const [messages, setMessages] = useState<Array<{
    text: string;
    isAgent: boolean;
    feedback?: { emoji: string; phrase: string };
  }>>([]);

  // Feedbacks de ejemplo para pruebas
  const feedbacks = [
    { emoji: "👍", phrase: "¡Buen tono de voz!" },
    { emoji: "🎯", phrase: "Excelente explicación" },
    { emoji: "💡", phrase: "Punto clave identificado" }
  ];

  const conversation = useConversation({
    onMessage: (message) => {
      console.log("Mensaje recibido:", message);
      if (message.source === "ai") {
        setMessages(prev => [...prev, {
          text: message.message,
          isAgent: true,
          feedback: feedbacks[Math.floor(Math.random() * feedbacks.length)]
        }]);
      } else if (message.source === "user") {
        setMessages(prev => [...prev, {
          text: message.message,
          isAgent: false
        }]);
      }
    },
    onError: (error) => {
      console.error("Error en la conversación:", error);
      toast({
        title: "Error",
        description: "Error de conexión con el agente",
        variant: "destructive",
      });
    },
    onConnect: () => {
      console.log("Conexión establecida");
      setMessages([{
        text: "¡Hola! Soy tu agente de análisis. ¿En qué puedo ayudarte?",
        isAgent: true
      }]);
    },
  });

  const startProcessingCountdown = () => {
    setIsProcessing(true);
    setProcessingTimeLeft(15); // Cambiado a 15 segundos para pruebas
    setPdfReady(false);
    setPdfUrl(null);

    processingInterval.current = setInterval(() => {
      setProcessingTimeLeft(prev => {
        if (prev <= 0) {
          clearInterval(processingInterval.current);
          setIsProcessing(false);
          setPdfReady(true);
          setPdfUrl('https://ejemplo.com/analisis.pdf');
          toast({
            title: "¡Análisis completado!",
            description: "PDF listo para descargar",
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleBackendReady = () => {
    if (processingInterval.current) {
      clearInterval(processingInterval.current);
    }
    setIsProcessing(false);
    setPdfReady(true);
    setPdfUrl('https://ejemplo.com/analisis.pdf');
    toast({
      title: "¡Análisis completado!",
      description: "PDF generado correctamente",
    });
  };

  const handleDownloadPDF = () => {
    if (pdfUrl) {
      // Aquí iría la lógica real de descarga del PDF
      toast({
        title: "Descargando PDF",
        description: "Tu análisis se está descargando...",
      });
    }
  };

  const cancelProcessing = () => {
    if (processingInterval.current) {
      clearInterval(processingInterval.current);
    }
    setIsProcessing(false);
    setProgressValue(0);
    setProcessingTimeLeft(120);
    setPdfReady(false);
    setPdfUrl(null);
    toast({
      title: "Procesamiento cancelado",
      description: "Se ha cancelado el procesamiento del audio",
    });
  };

  useEffect(() => {
    return () => {
      if (processingInterval.current) {
        clearInterval(processingInterval.current);
      }
    };
  }, []);

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const file = new File([audioBlob], 'recording.webm', { type: 'audio/webm' });
        handleFileUpload(file);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      toast({
        title: "Grabación iniciada",
        description: "Hablando...",
      });
    } catch (error) {
      console.error("Error al iniciar la grabación:", error);
      toast({
        title: "Error",
        description: "No se pudo iniciar la grabación",
        variant: "destructive",
      });
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      toast({
        title: "Grabación finalizada",
        description: "Procesando audio...",
      });
    }
  };

  const handleFileUpload = (file: File) => {
    if (file && (file.type === "audio/mpeg" || file.type === "audio/mp3" || file.type === "audio/webm")) {
      console.log("Iniciando proceso de subida de archivo:", file.name);
      
      toast({
        title: "Archivo recibido",
        description: "Procesando el archivo de audio...",
      });
      
      let progress = 0;
      const interval = setInterval(() => {
        progress += 2;
        setProgressValue(progress);
        
        if (progress >= 100) {
          clearInterval(interval);
          startProcessingCountdown();
        }
      }, 100);
    } else {
      toast({
        title: "Error",
        description: "Por favor selecciona un archivo de audio válido (MP3 o WebM)",
        variant: "destructive",
      });
    }
  };

  const handleStartAgent = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      conversation.startSession({
        agentId: "0gLnzcbTHPrgMkiYcNFr", // Actualizado al nuevo ID del agente
      });
    } catch (error) {
      console.error("Error al acceder al micrófono:", error);
      toast({
        title: "Error",
        description: "No se pudo acceder al micrófono",
        variant: "destructive",
      });
    }
  };

  const handleStopAgent = () => {
    conversation.endSession();
    setIsAgentModalOpen(false);
  };

  const handlePlanSelection = (planType: string) => {
    const planConfig = PLAN_HANDLERS[planType];
    console.log(`Plan seleccionado: ${planConfig.name}`);
    
    if (planType === 'BASIC') {
      setIsUploadModalOpen(true);
      return;
    }
    
    if (planType === 'MEDIUM') {
      setIsAgentModalOpen(true);
      handleStartAgent();
      return;
    }
    
    if (planType === 'PRO' && planConfig.whatsappMessages) {
      const isRecurring = false;
      const message = isRecurring 
        ? planConfig.whatsappMessages.recurring 
        : planConfig.whatsappMessages.new;
      
      const encodedMessage = encodeURIComponent(message);
      window.open(`https://wa.me/+34123456789?text=${encodedMessage}`, '_blank');
      return;
    }
    
    setSelectedPlan(planType);
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {plans.map((plan) => (
          <PricingCard
            key={plan.name}
            {...plan}
            onSelect={handlePlanSelection}
          />
        ))}
      </div>

      <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Subir o Grabar Audio</DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <Tabs defaultValue="upload" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upload">Subir Archivo</TabsTrigger>
                <TabsTrigger value="record">Grabar Audio</TabsTrigger>
              </TabsList>
              <TabsContent value="upload" className="mt-4">
                <UploadButton onFileUpload={handleFileUpload} />
              </TabsContent>
              <TabsContent value="record" className="mt-4">
                <div className="flex flex-col items-center gap-4">
                  <RecordButton
                    isRecording={isRecording}
                    onToggleRecording={isRecording ? handleStopRecording : handleStartRecording}
                  />
                  <p className="text-sm text-gray-500">
                    {isRecording ? "Haz click para detener" : "Haz click para empezar a grabar"}
                  </p>
                </div>
              </TabsContent>
            </Tabs>
            
            {progressValue > 0 && progressValue < 100 && (
              <div className="space-y-2">
                <Progress value={progressValue} />
                <p className="text-sm text-center text-gray-500">
                  Procesando audio... {progressValue}%
                </p>
              </div>
            )}
            
            {isProcessing && (
              <div className="space-y-4">
                <ProcessingCountdown
                  timeLeft={processingTimeLeft}
                  onCancel={cancelProcessing}
                />
              </div>
            )}

            {pdfReady && pdfUrl && (
              <div className="flex flex-col items-center gap-4 pt-4">
                <p className="text-sm text-green-600 font-medium">
                  ¡Tu análisis está listo!
                </p>
                <Button
                  onClick={handleDownloadPDF}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <FileDown className="mr-2 h-4 w-4" />
                  Descargar PDF
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isAgentModalOpen} onOpenChange={(open) => {
        if (!open) handleStopAgent();
        setIsAgentModalOpen(open);
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Conversación con el Agente</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-6">
            <ScrollArea className="h-[400px] p-4 rounded-md border">
              <div className="flex flex-col gap-4">
                {messages.map((message, index) => (
                  <ChatMessage
                    key={index}
                    message={message.text}
                    isAgent={message.isAgent}
                    feedback={message.feedback}
                  />
                ))}
              </div>
            </ScrollArea>
            <div className="flex justify-center">
              <Button 
                onClick={handleStopAgent}
                variant="destructive"
                className="w-full max-w-xs"
              >
                Finalizar Conversación
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
