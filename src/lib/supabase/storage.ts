import type { SupabaseClient } from "@supabase/supabase-js";

export type Bucket = "logos" | "hero-sliders" | "about" | "services" | "portfolio";
export const ORDER_FILES_BUCKET = "order-files";

function extensionFor(file: File) {
  const fromName = file.name.includes(".") ? file.name.split(".").pop()!.toLowerCase() : "";
  if (/^[a-z0-9]{1,5}$/.test(fromName)) return fromName;
  const fromType = (file.type.split("/").pop() ?? "").replace(/[^a-z0-9]/g, "").slice(0, 5);
  return fromType || "bin";
}

// Admin images are uploaded straight from the browser (UploadField) and only
// the resulting public URL reaches the Server Action — Vercel caps a function
// request body at 4.5 MB, so files must never ride along in the action body.
const UPLOADED_IMAGE_PATH = /^[0-9a-f-]{36}\.[a-z0-9]{1,5}$/;

/**
 * The new image URL the admin UploadField put in `field`, or null if no new
 * image was chosen. A client-supplied URL is only accepted when it points at
 * a freshly uploaded object in `bucket` on this project's Storage.
 */
export function getUploadedImageUrl(formData: FormData, field: string, bucket: Bucket): string | null {
  const value = formData.get(field);
  if (typeof value !== "string" || !value) return null;
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return null;
  }
  if (url.host !== new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).host) return null;
  const marker = `/storage/v1/object/public/${bucket}/`;
  if (!url.pathname.startsWith(marker)) return null;
  return UPLOADED_IMAGE_PATH.test(url.pathname.slice(marker.length)) ? value : null;
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

// Order files are uploaded from the customer's browser before the order exists
// (same 4.5 MB Vercel body cap as above), so they live under a per-submission
// batch folder rather than the order id.
export function incomingOrderFilePath(batchId: string, fileName: string) {
  const extension = fileName.includes(".")
    ? fileName.split(".").pop()!.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 10)
    : "";
  return `incoming/${batchId}/${crypto.randomUUID()}${extension ? `.${extension}` : ""}`;
}

export const INCOMING_ORDER_FILE_PATH = /^incoming\/[0-9a-f-]{36}\/[0-9a-f-]{36}(\.[a-z0-9]{1,10})?$/;

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
