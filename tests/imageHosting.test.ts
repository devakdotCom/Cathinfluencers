import { afterEach, describe, expect, it, vi } from 'vitest';
import { uploadProfileImage, validateImageFile } from '../src/services/imageHosting';

function pngFile() {
  return new File(
    [new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0])],
    'profile.png',
    { type: 'image/png' },
  );
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe('free image hosting', () => {
  it('rejects a file whose declared MIME type does not match its bytes', async () => {
    const fake = new File(['not an image'], 'fake.png', { type: 'image/png' });
    await expect(validateImageFile(fake)).rejects.toThrow(/valid image/i);
  });

  it('requires Cloudinary configuration before upload', async () => {
    vi.stubEnv('VITE_CLOUDINARY_CLOUD_NAME', '');
    vi.stubEnv('VITE_CLOUDINARY_UNSIGNED_UPLOAD_PRESET', '');
    await expect(uploadProfileImage(pngFile())).rejects.toThrow(/not configured/i);
  });

  it('stores only a Cloudinary HTTPS delivery URL', async () => {
    vi.stubEnv('VITE_CLOUDINARY_CLOUD_NAME', 'demo-cloud');
    vi.stubEnv('VITE_CLOUDINARY_UNSIGNED_UPLOAD_PRESET', 'vox-profile-images');
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({
      secure_url: 'https://res.cloudinary.com/demo-cloud/image/upload/profile.png',
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }));

    await expect(uploadProfileImage(pngFile())).resolves.toBe(
      'https://res.cloudinary.com/demo-cloud/image/upload/profile.png',
    );
  });
});
