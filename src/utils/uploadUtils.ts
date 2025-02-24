
import { supabase } from "../integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { MAKE_WEBHOOK_URL, MAKE_RECORDING_WEBHOOK_URL } from "./constants";

export const uploadToSupabase = async (audioBlob: Blob): Promise<string | null> => {
  const BUCKET_NAME = "audio_chunks";
  
  try {
    console.log('Iniciando proceso de subida:', {
      bucketName: BUCKET_NAME,
      blobTipo: audioBlob.type,
      blobTamaño: audioBlob.size
    });

    // Generate unique filename with correct extension based on MIME type
    const timestamp = new Date().getTime();
    const randomString = Math.random().toString(36).substring(7);
    const fileExtension = getFileExtension(audioBlob.type);
    const fileName = `audio-${timestamp}-${randomString}.${fileExtension}`;

    console.log('Preparando subida con nombre de archivo:', fileName);

    // Upload file to Supabase
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, audioBlob, {
        cacheControl: '3600',
        upsert: false,
        contentType: audioBlob.type
      });

    if (uploadError) {
      console.error('Error al subir a Supabase:', uploadError);
      throw uploadError;
    }

    console.log('Archivo subido exitosamente:', uploadData);

    // Get public URL
    const { data: publicUrlData } = await supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName);

    if (!publicUrlData?.publicUrl) {
      throw new Error('No se pudo obtener la URL pública');
    }

    console.log('URL pública generada:', publicUrlData.publicUrl);
    
    return publicUrlData.publicUrl;

  } catch (error) {
    console.error('Error inesperado en el proceso de subida:', error);
    toast({
      title: "Error",
      description: "Error al subir el archivo a Supabase",
      variant: "destructive",
    });
    return null;
  }
};

// Función auxiliar para determinar la extensión del archivo
const getFileExtension = (mimeType: string): string => {
  const mimeToExt: { [key: string]: string } = {
    'audio/mpeg': 'mp3',
    'audio/mp3': 'mp3',
    'audio/wav': 'wav',
    'audio/wave': 'wav',
    'audio/ogg': 'ogg',
    'audio/aac': 'aac',
    'audio/m4a': 'm4a',
    'audio/webm': 'webm'
  };

  return mimeToExt[mimeType] || 'mp3'; // Por defecto mp3 si no se reconoce el tipo
};

export const sendToMakeWebhook = async (audioUrl: string, isRecording: boolean = false): Promise<boolean> => {
  try {
    const webhookUrl = isRecording ? MAKE_RECORDING_WEBHOOK_URL : MAKE_WEBHOOK_URL;
    console.log(`Enviando URL al webhook (${isRecording ? 'grabación' : 'archivo'}):`, audioUrl);

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        audioUrl,
        source: isRecording ? 'recording' : 'upload'
      }),
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    // Obtener y mostrar la respuesta del webhook
    const responseData = await response.json();
    console.log('Respuesta del webhook:', responseData);

    console.log('Webhook enviado exitosamente');
    return true;

  } catch (error) {
    console.error('Error al enviar webhook:', error);
    toast({
      title: "Error",
      description: "Error al procesar el audio en Make",
      variant: "destructive",
    });
    return false;
  }
};

