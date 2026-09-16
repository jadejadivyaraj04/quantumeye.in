import { rawUrl, REPO, writeBinary } from "./github";

/**
 * Captures, picked from the machine and committed to the repository.
 *
 * Resizing happens here, in the browser, to the same specifications the
 * hand-processed captures already use: a phone screen is useless above 600px
 * on this site, and a 3MB original on the critical path is worse than useless.
 * What lands in the repo is what the site would have shipped anyway.
 *
 * Uploads commit immediately, unlike text edits, which stay a draft until you
 * publish. An image that is uploaded and then discarded just sits in the
 * repository unreferenced - cheap, and recoverable, which is the right way
 * round for something you might want back.
 */

/** Widths the site actually renders at, doubled for retina. */
export const TARGET_WIDTH = {
  /** Phone captures: strips, cards and dialogs never exceed ~300px. */
  phones: 600,
  /** Browser captures: shown up to ~550px wide in a Lab card. */
  wide: 1100,
} as const;

const QUALITY = 0.78;
const MAX_INPUT_BYTES = 25 * 1024 * 1024;

export interface PreparedImage {
  bytes: ArrayBuffer;
  width: number;
  height: number;
  /** Bytes before resizing, so the saving can be reported. */
  originalBytes: number;
}

/**
 * Decodes, scales down if needed, and re-encodes as JPEG.
 *
 * Images are never scaled up: a 400px capture stays 400px rather than being
 * stretched to the target and looking worse than the original.
 */
export async function prepareImage(
  file: File,
  maxWidth: number,
): Promise<PreparedImage> {
  if (file.size > MAX_INPUT_BYTES) {
    throw new Error(
      `${file.name} is ${(file.size / 1024 / 1024).toFixed(1)}MB. Anything over 25MB is almost certainly not a screenshot.`,
    );
  }

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxWidth / bitmap.width);
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("This browser would not give up a canvas context.");
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", QUALITY),
  );
  if (!blob) throw new Error("Could not encode that image as JPEG.");

  return {
    bytes: await blob.arrayBuffer(),
    width,
    height,
    originalBytes: file.size,
  };
}

/** A repo-safe, readable filename that will not collide with an existing one. */
export function captureName(hint: string, original: string): string {
  const base = `${hint}-${original.replace(/\.[^.]+$/, "")}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  // Minutes are enough to separate two uploads of the same screen, and keep
  // the name readable in the repository.
  const stamp = new Date().toISOString().slice(2, 16).replace(/[-:T]/g, "");
  return `${base || "capture"}-${stamp}.jpg`;
}

export interface Uploaded {
  /** Public URL, usable by the live site with no rebuild. */
  url: string;
  path: string;
  width: number;
  height: number;
  bytes: number;
  originalBytes: number;
}

export async function uploadCapture(
  token: string,
  args: { file: File; hint: string; maxWidth: number },
): Promise<Uploaded> {
  const prepared = await prepareImage(args.file, args.maxWidth);
  const name = captureName(args.hint, args.file.name);
  const path = `${REPO.mediaDir}/${name}`;

  await writeBinary(token, {
    path,
    bytes: prepared.bytes,
    message: `Capture: add ${name}`,
  });

  return {
    url: rawUrl(path),
    path,
    width: prepared.width,
    height: prepared.height,
    bytes: prepared.bytes.byteLength,
    originalBytes: prepared.originalBytes,
  };
}
