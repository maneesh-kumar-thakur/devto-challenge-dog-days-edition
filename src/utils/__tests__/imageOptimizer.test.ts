import { describe, it, expect } from 'vitest';
import { extractBase64Payload, isValidImageFile } from '../imageOptimizer';

describe('imageOptimizer - extractBase64Payload', () => {
  it('should extract mimeType and base64 from a standard data URI', () => {
    const input = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';
    const result = extractBase64Payload(input);
    expect(result.mimeType).toBe('image/png');
    expect(result.base64Data).toBe('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=');
  });

  it('should handle jpeg data URIs with extra whitespace or newlines', () => {
    const input = 'data:image/jpeg;base64,\n/9j/4AAQSkZJRgABAQEASABIAAD\r\n/2wBDAP///w==  ';
    const result = extractBase64Payload(input);
    expect(result.mimeType).toBe('image/jpeg');
    expect(result.base64Data).toBe('/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP///w==');
  });

  it('should handle raw base64 string without data: prefix', () => {
    const input = 'aGVsbG9kb2c=';
    const result = extractBase64Payload(input);
    expect(result.mimeType).toBe('image/jpeg'); // default fallback
    expect(result.base64Data).toBe('aGVsbG9kb2c=');
  });

  it('should handle empty or null input gracefully', () => {
    const result = extractBase64Payload('');
    expect(result.mimeType).toBe('image/jpeg');
    expect(result.base64Data).toBe('');
  });
});

describe('imageOptimizer - isValidImageFile', () => {
  it('should approve valid jpeg, png, and webp types', () => {
    expect(isValidImageFile({ type: 'image/jpeg', size: 1024 }).valid).toBe(true);
    expect(isValidImageFile({ type: 'image/png', size: 2048 }).valid).toBe(true);
    expect(isValidImageFile({ type: 'image/webp', size: 4096 }).valid).toBe(true);
  });

  it('should reject non-image file types', () => {
    const res = isValidImageFile({ type: 'application/pdf', size: 1024 });
    expect(res.valid).toBe(false);
    expect(res.error).toContain('valid image file');
  });

  it('should reject files exceeding 25MB', () => {
    const hugeSize = 26 * 1024 * 1024;
    const res = isValidImageFile({ type: 'image/jpeg', size: hugeSize });
    expect(res.valid).toBe(false);
    expect(res.error).toContain('limit');
  });
});
