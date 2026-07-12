import { memo, useEffect, useRef } from "react";
import { STRINGS } from "../i18n/strings.js";

export const VisualizerWindow = memo(function VisualizerWindow({
  audioEngine,
  active,
  isPlaying,
  hasTrack,
}) {
  const canvasRef = useRef(null);
  const rafRef = useRef(0);
  const phaseRef = useRef(0);

  useEffect(() => {
    audioEngine?.setAnalyserActive?.(active);
    if (!active || !audioEngine) return undefined;

    const canvas = canvasRef.current;
    const analyser = audioEngine.getAnalyser?.();
    if (!canvas || !analyser) return undefined;

    const ctx = canvas.getContext("2d");
    if (!ctx) return undefined;

    const data = new Uint8Array(analyser.frequencyBinCount);
    const barCount = 32;
    const step = Math.max(1, Math.floor(data.length / barCount));

    const draw = () => {
      const { width, height } = canvas;
      ctx.fillStyle = "#0f1419";
      ctx.fillRect(0, 0, width, height);

      if (isPlaying && hasTrack) {
        analyser.getByteFrequencyData(data);
        const barWidth = width / barCount;
        for (let i = 0; i < barCount; i++) {
          const sample = data[i * step] ?? 0;
          const h = (sample / 255) * height * 0.9;
          ctx.fillStyle = `hsl(${150 + (sample / 255) * 60}, 75%, 45%)`;
          ctx.fillRect(i * barWidth + 1, height - h, barWidth - 2, h);
        }
      } else {
        phaseRef.current += 0.03;
        ctx.font = "600 13px system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.fillStyle = "rgba(45, 212, 191, 0.85)";
        ctx.fillText(STRINGS.visualizer, width / 2, height / 2 - 10);
        ctx.font = "11px system-ui, sans-serif";
        ctx.fillStyle = "rgba(136, 136, 136, 0.95)";
        ctx.fillText(
          hasTrack ? STRINGS.visualizerPaused : STRINGS.visualizerEmpty,
          width / 2,
          height / 2 + 12,
        );
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(rafRef.current);
      audioEngine.setAnalyserActive?.(false);
    };
  }, [audioEngine, active, isPlaying, hasTrack]);

  return (
    <div className="dmp-viz">
      <p className="dmp-viz__hint">{STRINGS.visualizerHint}</p>
      <canvas ref={canvasRef} width={280} height={140} className="dmp-viz__canvas" />
    </div>
  );
});
