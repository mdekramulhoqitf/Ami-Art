import type { SupabaseClient } from "@supabase/supabase-js";

export type Bucket = "logos" | "hero-sliders" | "about" | "services" | "portfolio";
export const ORDER_FILES_BUCKET = "order-files";

function extensionFor(file: File) {
  const fromName = file.name.split(".").pop();
  if (fromName && fromName.length <= 5) return fromName.toLowerCase();
  const fromType = file.type.split("/").pop();
  return fromType ?? "bin";
}

export async function uploadImage(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any>,
  bucket: Bucket,
  file: File
): Promise<string> {
  const path = `${crypto.randomUUID()}.${extensionFor(file)}`;

  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });

  if (error) {
    throw new Error(`Failed to upload image: ${error.message}`);
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export function pathFromPublicUrl(bucket: Bucket, url: string | null): string | null {
  if (!url) return null;
  const marker = `/storage/v1/object/public/${bucket}/`;
  const index = url.indexOf(marker);
  if (index === -1) return null;
  return url.slice(index + marker.length);
}

export async function deleteImage(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any>,
  bucket: Bucket,
  url: string | null
) {
  const path = pathFromPublicUrl(bucket, url);
  if (!path) return;
  await supabase.storage.from(bucket).remove([path]);
}

// ---------------------------------------------------------------------------
// Order files — private bucket, arbitrary file types (not just images).
// ---------------------------------------------------------------------------

export function orderFilePath(orderId: string, folder: "customer-files" | "messages", fileName: string) {
  const extension = fileName.split(".").pop();
  const safeName = `${crypto.randomUUID()}${extension ? `.${extension.toLowerCase()}` : ""}`;
  return `${orderId}/${folder}/${safeName}`;
}

export async function uploadOrderFile(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any>,
  path: string,
  file: File
) {
  const { error } = await supabase.storage.from(ORDER_FILES_BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });

  if (error) {
    throw new Error("ফাইল আপলোড করা যায়নি। আবার চেষ্টা করুন।");
  }
}

export async function getSignedOrderFileUrl(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any>,
  path: string,
  expiresInSeconds = 60
): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from(ORDER_FILES_BUCKET)
    .createSignedUrl(path, expiresInSeconds);
  if (error) return null;
  return data.signedUrl;
}
