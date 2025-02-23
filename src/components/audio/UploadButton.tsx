
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Upload } from "lucide-react";
import { useRef, useState } from "react";
import { uploadToSupabase, sendToMakeWebhook } from "../../utils/uploadUtils";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "../ui/progress";

interface UploadButtonProps {
  onFileUpload: (file: File) => void;
}

export const UploadButton = ({ onFileUpload }: UploadButtonProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        setIsUploading(true);
        setUploadProgress(0);
        
        console.log('Archivo seleccionado:', {
          nombre: file.name,
          tipo: file.type,
          tamaño: file.size
        });

        // Convertir File a Blob
        const audioBlob = new Blob([file], { type: file.type });
        
        // Subir a Supabase con progreso
        const publicUrl = await uploadToSupabase(audioBlob, (progress) => {
          setUploadProgress(progress);
        });
        
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
          description: "No se pudo procesar el archivo",
          variant: "destructive",
        });
      } finally {
        setIsUploading(false);
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
        className={`w-16 h-16 rounded-full flex items-center justify-center transition-transform ${
          isUploading ? 'scale-110 animate-pulse' : ''
        }`}
        disabled={isUploading}
      >
        <Upload className="w-6 h-6" />
      </Button>
      {isUploading && (
        <div className="w-full max-w-xs animate-fade-in">
          <Progress value={uploadProgress} className="h-2" />
          <p className="text-sm text-gray-500 text-center mt-2">
            Subiendo... {uploadProgress}%
          </p>
        </div>
      )}
      {!isUploading && (
        <p className="text-sm text-gray-500">
          Haz click para seleccionar un archivo
        </p>
      )}
    </div>
  );
};
