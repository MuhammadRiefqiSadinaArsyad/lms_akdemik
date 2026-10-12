import { makePdf } from "./pdf";
import { getSupabase, getSupabaseAdmin, isSupabaseConfigured } from "./supabase";

type Stored = { data: Buffer; name: string; type: string };

const g = globalThis as unknown as { __files?: Map<string, Stored> };
const mem = (g.__files ??= new Map<string, Stored>());

function bucketFor(path: string): { bucket: string; key: string } {
  if (path.startsWith("materials/")) return { bucket: "learning-materials", key: path.slice("materials/".length) };
  if (path.startsWith("submissions/")) return { bucket: "student-submissions", key: path.slice("submissions/".length) };
  return { bucket: "learning-materials", key: path };
}

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
export const ALLOWED_TYPES = ["application/pdf"];

/** batas size + tipe PDF; dipanggil di server action SEBELUM putFile */
export function checkUpload(file: { size: number; type: string }): string | null {
  if (file.size > MAX_UPLOAD_BYTES) return "Ukuran file maksimal 10 MB.";
  if (!ALLOWED_TYPES.includes(file.type)) return "Hanya file PDF yang diizinkan.";
  return null;
}

export async function putFile(
  path: string,
  data: Buffer,
  name: string,
  type: string,
): Promise<{ file_path: string; file_name: string; file_type: string; file_size: number }> {
  // ponytail: Supabase Storage bila env ada, else mock mem
  if (isSupabaseConfigured) {
    try {
      const supabase = getSupabaseAdmin() ?? getSupabase();
      const { bucket, key } = bucketFor(path);
      const { error } = await supabase!.storage.from(bucket).upload(key, data, {
        contentType: type || "application/octet-stream",
        upsert: true,
      });
      if (!error) {
        mem.set(path, { data, name, type });
        return { file_path: path, file_name: name, file_type: type, file_size: data.length };
      }
    } catch {}
  }
  mem.set(path, { data, name, type });
  return { file_path: path, file_name: name, file_type: type, file_size: data.length };
}

export function putFileMeta(path: string, name: string, type: string, size: number) {
  mem.set(path, { data: Buffer.from([]), name, type });
  void size;
  return { file_path: path, file_name: name, file_type: type, file_size: size };
}


export async function deleteFile(path: string): Promise<void> {
  mem.delete(path);
  if (!isSupabaseConfigured) return;
  const { bucket, key } = bucketFor(path);
  const { error } = await (getSupabaseAdmin() ?? getSupabase())!.storage.from(bucket).remove([key]);
  if (error) throw new Error(`storage: ${error.message}`);
}

export async function getFile(path: string): Promise<{ bytes: Buffer; name: string; type: string }> {
  if (isSupabaseConfigured) {
    try {
      const supabase = getSupabaseAdmin() ?? getSupabase();
      const { bucket, key } = bucketFor(path);
      const { data, error } = await supabase!.storage.from(bucket).download(key);
      if (!error && data) {
        const ab = await data.arrayBuffer();
        const hit = mem.get(path);
        return { bytes: Buffer.from(ab), name: hit?.name ?? path.split("/").pop() ?? "dokumen.pdf", type: hit?.type ?? "application/pdf" };
      }
    } catch {}
  }
  const hit = mem.get(path);
  if (hit && hit.data.length > 0) return { bytes: hit.data, name: hit.name, type: hit.type };
  const name = path.split("/").pop() ?? "dokumen.pdf";
  return {
    bytes: makePdf(["EduClass", `File: ${name}`, "", "Dokumen demo - konten asli tidak tersedia."]),
    name,
    type: "application/pdf",
  };
}

// sync compat for callers not yet awaited — delegates to mem only
export function getFileSync(path: string): { bytes: Buffer; name: string; type: string } {
  const hit = mem.get(path);
  if (hit && hit.data.length > 0) return { bytes: hit.data, name: hit.name, type: hit.type };
  const name = path.split("/").pop() ?? "dokumen.pdf";
  return { bytes: makePdf(["EduClass", `File: ${name}`, "", "Dokumen demo - konten asli tidak tersedia."]), name, type: "application/pdf" };
}
