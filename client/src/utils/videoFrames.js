/**
 * Video Frame Extraction Utility
 *
 * Extracts 4–6 evenly-spaced frames from a video file using
 * an HTML5 <video> element and <canvas>, without ffmpeg.
 * Used for AI form-check submissions (Phase 7).
 */

/**
 * Extract frames from a video File/Blob as base64 JPEG strings.
 *
 * @param {File|Blob} videoFile - The video file to extract frames from
 * @param {number} [frameCount=5] - Number of frames to extract (4–6)
 * @returns {Promise<string[]>} Array of base64 data URLs (image/jpeg)
 */
export async function extractFrames(videoFile, frameCount = 5) {
  frameCount = Math.max(4, Math.min(6, frameCount));

  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const frames = [];

    video.preload = 'auto';
    video.muted = true;
    video.playsInline = true;

    video.onloadedmetadata = () => {
      const duration = video.duration;
      if (!duration || duration < 0.5) {
        reject(new Error('Video is too short or could not be loaded'));
        return;
      }

      canvas.width = Math.min(video.videoWidth, 640);
      canvas.height = Math.round(
        canvas.width * (video.videoHeight / video.videoWidth)
      );

      // Calculate evenly-spaced timestamps (avoid the very start and end)
      const margin = duration * 0.05; // 5% margin
      const usableDuration = duration - 2 * margin;
      const interval = usableDuration / (frameCount - 1);
      const timestamps = Array.from(
        { length: frameCount },
        (_, i) => margin + i * interval
      );

      let index = 0;

      const captureFrame = () => {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        frames.push(canvas.toDataURL('image/jpeg', 0.85));
        index++;

        if (index < timestamps.length) {
          video.currentTime = timestamps[index];
        } else {
          // Clean up
          URL.revokeObjectURL(video.src);
          resolve(frames);
        }
      };

      video.onseeked = captureFrame;
      video.currentTime = timestamps[0];
    };

    video.onerror = () => {
      URL.revokeObjectURL(video.src);
      reject(new Error('Failed to load video file'));
    };

    video.src = URL.createObjectURL(videoFile);
  });
}
