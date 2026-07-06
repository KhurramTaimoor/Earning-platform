import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../config/supabase.js';

export async function uploadFile(file, folder = 'uploads') {
  if (!file) return null;

  const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'bms-files';
  const ext = file.originalname?.split('.').pop() || 'bin';
  const fileName = `${folder}/${uuidv4()}.${ext}`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file.buffer, {
      contentType: file.mimetype,
      upsert: false
    });

  if (error) throw error;

  const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
  return data.publicUrl;
}
