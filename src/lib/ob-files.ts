const UPLOAD_URL = "https://otherbrain-tech-ob-files-oficial.ddt6vc.easypanel.host/api/upload";

/**
 * Sube un archivo a OB_FILES y devuelve la URL
 */
export async function uploadToOBFiles(
  fileData: Buffer | string, // Buffer o Base64 (sin prefijo)
  filename: string,
  mimeType: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  const token = process.env.OB_FILES_TOKEN;
  
  if (!token) {
    return { success: false, error: "OB_FILES_TOKEN no configurado" };
  }

  try {
    const base64 = typeof fileData === "string" 
      ? fileData 
      : fileData.toString("base64");

    const res = await fetch(UPLOAD_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token_project: token,
        filename,
        file: base64,
        mimeType,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return { success: false, error: `OB_FILES error: ${err}` };
    }

    const data = await res.json();
    
    if (!data.success || !data.url) {
      return { success: false, error: "No se recibió URL de OB_FILES" };
    }

    return { success: true, url: data.url };
  } catch (error: any) {
    console.error("Error uploading to OB_FILES:", error);
    return { success: false, error: error.message };
  }
}
