import { memo, useState } from "react";
import { STRINGS } from "../i18n/strings.js";

function formatTime(ms) {
  if (!ms || ms < 0) return "0:00";
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, "0")}`;
}

function IconPlay() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function IconPause() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M6 5h4v14H6V5zm8 0h4v14h-4V5z" />
    </svg>
  );
}

function IconVolume({ level }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      {level === 0 ? (
        <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.71-1.8L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
      ) : (
        <path d="M3 10v4h4l5 5V5L7 10H3zm13.5 2c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.74 2.5-2.26 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
      )}
    </svg>
  );
}

export const MainWindow = memo(function MainWindow({
  player,
  queueOpen,
  onToggleQueue,
  onOpenSound,
  onToggleCompact,
}) {
  const {
    currentTrack,
    isPlaying,
    loading,
    positionMs,
    volume,
    togglePlay,
    seek,
    playNext,
    playPrevious,
    setVolume,
  } = player;

  const durationMs = currentTrack?.durationMs ?? 0;
  const progress = durationMs ? Math.min(100, (positionMs / durationMs) * 100) : 0;
  const hasTrack = Boolean(currentTrack);
  const volPct = Math.round(volume * 100);

  const handleSeek = (e) => {
    if (!durationMs) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    seek(Math.floor(ratio * durationMs));
  };

  return (
    <div className="dmp-main">
      <div className="dmp-now-playing">
        <div className="dmp-now-playing__art" aria-hidden>
          {hasTrack ? "♪" : "🎵"}
        </div>
        <div className="dmp-now-playing__info">
          <span className="dmp-now-playing__label">{STRINGS.nowPlaying}</span>
          <h2 className="dmp-now-playing__title">{currentTrack?.title ?? STRINGS.chooseTrack}</h2>
          <p className="dmp-now-playing__artist">
            {currentTrack?.artist ?? STRINGS.tapToPlay}
          </p>
        </div>
      </div>

      <button
        type="button"
        className="dmp-seek"
        onClick={handleSeek}
        aria-label="Posición en la canción"
        disabled={!hasTrack}
      >
        <div className="dmp-seek__track">
          <div className="dmp-seek__fill" style={{ width: `${progress}%` }} />
        </div>
        <div className="dmp-seek__times">
          <span>{formatTime(positionMs)}</span>
          <span>{hasTrack ? formatTime(durationMs) : "—"}</span>
        </div>
      </button>

      <div className="dmp-controls dmp-controls--primary">
        <button
          type="button"
          className="dmp-btn dmp-btn--secondary"
          onClick={playPrevious}
          disabled={!hasTrack}
          aria-label={STRINGS.previous}
          title={STRINGS.previous}
        >
          ⏮
        </button>
        <button
          type="button"
          className="dmp-btn dmp-btn--play"
          onClick={togglePlay}
          disabled={loading}
          aria-label={isPlaying ? STRINGS.pause : STRINGS.play}
        >
          {loading ? "…" : isPlaying ? <IconPause /> : <IconPlay />}
        </button>
        <button
          type="button"
          className="dmp-btn dmp-btn--secondary"
          onClick={playNext}
          disabled={!hasTrack}
          aria-label={STRINGS.next}
          title={STRINGS.next}
        >
          ⏭
        </button>
      </div>

      <label className="dmp-volume dmp-volume--friendly">
        <IconVolume level={volume === 0 ? 0 : 1} />
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          aria-label={STRINGS.volume}
        />
        <span className="dmp-volume__pct">{volPct}%</span>
      </label>

      <div className="dmp-actions">
        <button type="button" className="dmp-action" onClick={onToggleQueue}>
          {queueOpen ? STRINGS.hideQueue : STRINGS.showQueue}
        </button>
        <button type="button" className="dmp-action" onClick={onOpenSound}>
          {STRINGS.sound}
        </button>
        <button type="button" className="dmp-action dmp-action--muted" onClick={onToggleCompact}>
          {STRINGS.miniPlayer}
        </button>
      </div>
    </div>
  );
});

export function InlineQueue({ tracks, currentId, onSelect, open }) {
  if (!open) return null;
  return (
    <div className="dmp-inline-queue">
      <h3 className="dmp-inline-queue__title">{STRINGS.queue}</h3>
      {tracks.length === 0 ? (
        <p className="dmp-inline-queue__empty">{STRINGS.queueEmpty}</p>
      ) : (
        <ul className="dmp-playlist__list">
          {tracks.map((track, i) => (
            <li key={track.id}>
              <button
                type="button"
                className={`dmp-playlist__item${track.id === currentId ? " is-active" : ""}`}
                onClick={() => onSelect(track)}
              >
                <span className="dmp-playlist__num">{i + 1}</span>
                <span className="dmp-playlist__meta">
                  <strong>{track.title}</strong>
                  <small>{track.artist}</small>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
