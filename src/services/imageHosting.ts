const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

interface CloudinaryUploadResponse {
  secure_url?: string;
  error?: {
    message?: string;
  };
}

export function isCloudinaryUploadConfigured() {
  return Boolean(
    import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
    && import.meta.env.VITE_CLOUDINARY_UNSIGNED_UPLOAD_PRESET,
  );
}

function matchesImageSignature(bytes: Uint8Array, type: string) {
  if (type === 'image/png') {
    return bytes.length >= 8
      && bytes[0] === 0x89
      && bytes[1] === 0x50
      && bytes[2] === 0x4e
      && bytes[3] === 0x47
      && bytes[4] === 0x0d
      && bytes[5] === 0x0a
      && bytes[6] === 0x1a
      && bytes[7] === 0x0a;
  }
  if (type === 'image/jpeg') {
    return bytes.length >= 3
      && bytes[0] === 0xff
      && bytes[1] === 0xd8
      && bytes[2] === 0xff;
  }
  if (type === 'image/webp') {
    return bytes.length >= 12
      && String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF'
      && String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP';
  }
  return false;
}

export async function validateImageFile(file: File) {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error('Please upload a JPEG, PNG, or WebP image.');
  }
  if (file.size <= 0 || file.size > MAX_IMAGE_BYTES) {
    throw new Error('Please select an image smaller than 2 MB.');
  }

  const header = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  if (!matchesImageSignature(header, file.type)) {
    throw new Error('The selected file does not contain a valid image.');
  }
}

export async function uploadProfileImage(file: File) {
  await validateImageFile(file);

  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME?.trim();
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UNSIGNED_UPLOAD_PRESET?.trim();
  if (!cloudName || !uploadPreset) {
    throw new Error(
      'Free image hosting is not configured. Add the Cloudinary cloud name and unsigned upload preset.',
    );
  }

  const body = new FormData();
  body.append('file', file);
  body.append('upload_preset', uploadPreset);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/image/upload`,
    { method: 'POST', body },
  );
  const result = await response.json() as CloudinaryUploadResponse;
  if (!response.ok || !result.secure_url) {
    throw new Error(result.error?.message || 'Cloudinary could not upload this image.');
  }
  if (!result.secure_url.startsWith('https://res.cloudinary.com/')) {
    throw new Error('The image host returned an unexpected URL.');
  }

  return result.secure_url;
}
