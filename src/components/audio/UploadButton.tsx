
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Upload } from "lucide-react";
import { useRef } from "react";
import { uploadToSupabase, sendToMakeWebhook } from "../../utils/uploadUtils";
import { useToast } from "@/hooks/use-toast";

interface UploadButtonProps {
  onFileUpload: (file: File) => void;
}

export const UploadButton = ({ onFileUpload }: UploadButtonProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        console.log('Archivo seleccionado:', {
          nombre: file.name,
          tipo: file.type,
          tamaño: file.size
        });
        
        // Validar tipo de archivo
        const allowedTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/wave', 'audio/ogg', 'audio/aac', 'audio/m4a'];
        if (!allowedTypes.includes(file.type)) {
          throw new Error('Formato de audio no soportado. Por favor, use MP3, WAV, OGG, AAC o M4A.');
        }

        // Usar el archivo directamente sin convertir
        const audioBlob = file;
        
        // Subir a Supabase
        const publicUrl = await uploadToSupabase(audioBlob);
        
        if (!publicUrl) {
          throw new Error('Error al obtener la URL pública');
        }

        console.log('URL pública generada:', publicUrl);

        // Enviar al webhook de Make
        const webhookSuccess = await sendToMakeWebhook(publicUrl);
        
        if (!webhookSuccess) {
          throw new Error('Error al procesar en Make');
        }

        toast({
          title: "¡Éxito!",
          description: "Archivo procesado correctamente",
        });

        // Llamar al callback proporcionado
        onFileUpload(file);

      } catch (error) {
        console.error('Error en el proceso de subida:', error);
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "No se pudo procesar el archivo",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <Input
        type="file"
        accept="audio/*"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />
      <Button
        onClick={handleClick}
        className="w-16 h-16 rounded-full flex items-center justify-center"
      >
        <Upload className="w-6 h-6" />
      </Button>
      <p className="text-sm text-gray-500">
        Haz click para seleccionar un archivo
      </p>
    </div>
  );
};

