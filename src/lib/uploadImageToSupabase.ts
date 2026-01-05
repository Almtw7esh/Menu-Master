import { supabase } from './supabaseClient';

/**
 * Uploads an image file to Supabase Storage and returns the public URL.
 * @param file File to upload
 * @param folder Storage folder (e.g. 'restaurant-logos')
 * @returns Promise<string> Public URL of uploaded image
 */
export async function uploadImageToSupabase(file: File, folder: string = 'images'): Promise<string> {
  const fileName = `${Date.now()}_${file.name}`;
  const { data, error } = await supabase.storage.from(folder).upload(fileName, file);
  if (error) throw error;

  // Try to get public URL
  const { publicURL } = supabase.storage.from(folder).getPublicUrl(fileName);
  if (publicURL) return publicURL;

  // Fallback: construct the URL manually
  return `https://qwwhlsqwcpjygpmbxjxd.supabase.co/storage/v1/object/public/${folder}/${fileName}`;
}
