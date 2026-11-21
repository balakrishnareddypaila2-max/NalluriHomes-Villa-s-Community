import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import {
  Check,
  Move,
  RotateCcw,
  RotateCw,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';

export type CropAspectShape = 'circle' | 'square' | 'landscape';

interface ImageCropperModalProps {
  imageSrc: string;
  aspectShape?: CropAspectShape;
  outputWidth?: number;
  outputHeight?: number;
  title?: string;
  subtitle?: string;
  onCancel: () => void;
  onConfirm: (croppedDataUrl: string) => void | Promise<void>;
}

export const ImageCropperModal: React.FC<ImageCropperModalProps> = ({
  imageSrc,
  aspectShape = 'circle',
  outputWidth = 256,
  outputHeight = 256,
  title = 'Adjust & Crop Image',
  subtitle = 'Drag to reposition, pinch/slide to zoom, or rotate for the ideal frame.',
  onCancel,
  onConfirm,
}) => {
  const [naturalSize, setNaturalSize] = useState<{ w: number; h: number } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [saving, setSaving] = useState(false);

  const dragStartRef = useRef<{ x: number; y: number; origX: number; origY: number } | null>(null);
  const frameRef = useRef<HTMLDivElement | null>(null);

  const [viewportWidth, setViewportWidth] = useState<number>(() =>
    typeof window !== 'undefined' ? window.innerWidth : 400
  );

  useEffect(() => {
    const onResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const maxAvailableFrameW = Math.max(200, Math.min(320, viewportWidth - 88));
  const frameWidth =
    aspectShape === 'landscape'
      ? maxAvailableFrameW
      : Math.min(256, maxAvailableFrameW);
  const frameHeight =
    aspectShape === 'landscape'
      ? Math.round(frameWidth * (200 / 320))
      : frameWidth;

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setNaturalSize({ w: img.naturalWidth || img.width, h: img.naturalHeight || img.height });
      setZoom(1);
      setRotation(0);
      setOffset({ x: 0, y: 0 });
    };
    img.src = imageSrc;
  }, [imageSrc]);

  const getBaseScale = () => {
    if (!naturalSize) return 1;
    const isRotatedSideways = rotation % 180 !== 0;
    const imgW = isRotatedSideways ? naturalSize.h : naturalSize.w;
    const imgH = isRotatedSideways ? naturalSize.w : naturalSize.h;
    return Math.max(frameWidth / imgW, frameHeight / imgH);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      origX: offset.x,
      origY: offset.y,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging || !dragStartRef.current || !naturalSize) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;

    const baseScale = getBaseScale();
    const effectiveScale = baseScale * zoom;
    const isRotatedSideways = rotation % 180 !== 0;
    const renderedW = (isRotatedSideways ? naturalSize.h : naturalSize.w) * effectiveScale;
    const renderedH = (isRotatedSideways ? naturalSize.w : naturalSize.h) * effectiveScale;

    const maxX = Math.max(0, (renderedW - frameWidth) / 2);
    const maxY = Math.max(0, (renderedH - frameHeight) / 2);

    setOffset({
      x: Math.max(-maxX, Math.min(maxX, dragStartRef.current.origX + dx)),
      y: Math.max(-maxY, Math.min(maxY, dragStartRef.current.origY + dy)),
    });
  };

  const handlePointerUp = () => {
    setDragging(false);
    dragStartRef.current = null;
  };

  // Re-clamp offset if zoom, rotation, or frame size changes
  useEffect(() => {
    if (!naturalSize) return;
    const baseScale = getBaseScale();
    const effectiveScale = baseScale * zoom;
    const isRotatedSideways = rotation % 180 !== 0;
    const renderedW = (isRotatedSideways ? naturalSize.h : naturalSize.w) * effectiveScale;
    const renderedH = (isRotatedSideways ? naturalSize.w : naturalSize.h) * effectiveScale;
    const maxX = Math.max(0, (renderedW - frameWidth) / 2);
    const maxY = Math.max(0, (renderedH - frameHeight) / 2);

    setOffset((prev) => ({
      x: Math.max(-maxX, Math.min(maxX, prev.x)),
      y: Math.max(-maxY, Math.min(maxY, prev.y)),
    }));
  }, [zoom, rotation, naturalSize, frameWidth, frameHeight]);

  const handleConfirm = async () => {
    if (!naturalSize) return;
    setSaving(true);
    try {
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Could not decode image'));
        img.src = imageSrc;
      });

      const canvas = document.createElement('canvas');
      canvas.width = outputWidth;
      canvas.height = outputHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.fillStyle = '#0B3529';
      ctx.fillRect(0, 0, outputWidth, outputHeight);

      const outRatioX = outputWidth / frameWidth;
      const outRatioY = outputHeight / frameHeight;
      const baseScale = getBaseScale();
      const effectiveScale = baseScale * zoom;

      ctx.save();
      ctx.translate(
        outputWidth / 2 + offset.x * outRatioX,
        outputHeight / 2 + offset.y * outRatioY
      );
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(effectiveScale * outRatioX, effectiveScale * outRatioY);
      ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
      ctx.restore();

      const resultDataUrl = canvas.toDataURL('image/jpeg', 0.85);
      await onConfirm(resultDataUrl);
    } finally {
      setSaving(false);
    }
  };

  const baseScale = getBaseScale();
  const displayScale = baseScale * zoom;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onCancel}
      className="fixed inset-0 z-[70] flex items-center justify-center bg-[#00241A]/75 p-3 backdrop-blur-sm sm:p-5"
    >
      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 12 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 8 }}
        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[94vh] w-full max-w-md flex-col overflow-hidden rounded-3xl border border-[#C59B48]/45 bg-white shadow-2xl"
      >
        {/* Modal Header */}
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-[#E5ECE6] px-5 py-4 sm:px-6">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#85631E]">
              STUDIO IMAGE EDITOR
            </p>
            <h3 className="mt-0.5 font-serif text-xl font-medium text-[#141E1B]">{title}</h3>
            <p className="mt-0.5 text-xs leading-relaxed text-[#414B47]">{subtitle}</p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Cancel crop"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#E2DDD2] text-[#414B47] hover:bg-[#ECF2ED]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Body (Crop Stage + Controls) */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col items-center bg-[#141E1B] px-4 py-5 sm:px-6 sm:py-6">
            {/* Interactive Crop Viewport */}
            <div
              ref={frameRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              style={{ width: frameWidth, height: frameHeight }}
              className={`relative touch-none select-none overflow-hidden bg-[#0B3529] shadow-[0_0_0_2px_rgba(247,221,164,0.85)] ${
                aspectShape === 'circle' ? 'rounded-full' : 'rounded-2xl'
              } ${dragging ? 'cursor-grabbing' : 'cursor-grab'}`}
            >
              {naturalSize && (
                <img
                  src={imageSrc}
                  alt="Crop preview"
                  draggable={false}
                  style={{
                    width: naturalSize.w,
                    height: naturalSize.h,
                    maxWidth: 'none',
                    transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px) rotate(${rotation}deg) scale(${displayScale})`,
                  }}
                  className="pointer-events-none absolute left-1/2 top-1/2 origin-center"
                />
              )}

              {/* Rule-of-thirds overlay guide */}
              <div
                className={`pointer-events-none absolute inset-0 border border-white/25 ${
                  aspectShape === 'circle' ? 'rounded-full' : 'rounded-2xl'
                }`}
              >
                <div className="absolute inset-x-0 top-1/3 border-t border-white/15" />
                <div className="absolute inset-x-0 top-2/3 border-t border-white/15" />
                <div className="absolute inset-y-0 left-1/3 border-l border-white/15" />
                <div className="absolute inset-y-0 left-2/3 border-l border-white/15" />
              </div>
            </div>

            <div className="mt-3.5 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1 text-center text-[11px] font-medium text-[#F7DDA4]">
              <Move className="h-3 w-3 shrink-0" />
              <span>Drag image inside frame to adjust position</span>
            </div>
          </div>

          {/* Zoom, Rotation & Action Controls */}
          <div className="space-y-4 px-5 py-4 sm:px-6 sm:py-5">
            {/* Zoom Row */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(1, Number((z - 0.15).toFixed(2))))}
                aria-label="Zoom out"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#E2DDD2] bg-[#F4F6F1] text-[#0B3529] hover:bg-[#ECF2ED]"
              >
                <ZoomOut className="h-4 w-4" />
              </button>

              <input
                type="range"
                min={1}
                max={3.2}
                step={0.05}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                aria-label="Image zoom"
                className="h-2 min-w-0 flex-1 cursor-pointer accent-[#0B3529]"
              />

              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(3.2, Number((z + 0.15).toFixed(2))))}
                aria-label="Zoom in"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#E2DDD2] bg-[#F4F6F1] text-[#0B3529] hover:bg-[#ECF2ED]"
              >
                <ZoomIn className="h-4 w-4" />
              </button>

              <span className="w-10 shrink-0 text-right font-mono text-xs font-bold text-[#0B3529] tabular-nums">
                {zoom.toFixed(1)}×
              </span>
            </div>

            {/* Rotate & Reset Row */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setRotation((r) => (r + 90) % 360)}
                className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-[#E2DDD2] bg-[#F4F6F1] px-3 text-xs font-semibold text-[#141E1B] transition-colors hover:bg-[#ECF2ED] whitespace-nowrap"
              >
                <RotateCw className="h-3.5 w-3.5 shrink-0 text-[#85631E]" />
                <span>Rotate 90°</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setZoom(1);
                  setRotation(0);
                  setOffset({ x: 0, y: 0 });
                }}
                className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-[#E2DDD2] bg-white px-3 text-xs font-semibold text-[#414B47] transition-colors hover:bg-[#ECF2ED] whitespace-nowrap"
              >
                <RotateCcw className="h-3.5 w-3.5 shrink-0" />
                <span>Reset View</span>
              </button>
            </div>

            {/* Primary Cancel / Apply Action Row */}
            <div className="grid grid-cols-2 gap-2.5 border-t border-[#E5ECE6] pt-3.5">
              <button
                type="button"
                onClick={onCancel}
                className="inline-flex h-11 items-center justify-center rounded-xl border border-[#E2DDD2] bg-white px-4 text-xs font-semibold text-[#414B47] transition-colors hover:bg-[#ECF2ED] whitespace-nowrap"
              >
                Cancel
              </button>
              <motion.button
                whileTap={{ scale: 0.96 }}
                type="button"
                disabled={saving || !naturalSize}
                onClick={handleConfirm}
                className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl bg-[#0B3529] px-4 text-xs font-semibold text-[#FBF9F5] shadow-sm transition-colors hover:bg-[#00241A] disabled:opacity-60 whitespace-nowrap"
              >
                <Check className="h-4 w-4 shrink-0 text-[#F7DDA4]" />
                <span>{saving ? 'Applying...' : 'Apply & Save'}</span>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
