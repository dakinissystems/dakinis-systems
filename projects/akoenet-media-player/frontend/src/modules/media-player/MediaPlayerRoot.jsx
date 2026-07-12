import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MainWindow, InlineQueue } from "./components/MainWindow.jsx";
import { PlaylistWindow } from "./components/PlaylistWindow.jsx";
import { EqualizerWindow } from "./components/EqualizerWindow.jsx";
import { LibraryWindow } from "./components/LibraryWindow.jsx";
import { VisualizerWindow } from "./components/VisualizerWindow.jsx";
import { MiniPlayer } from "./components/MiniPlayer.jsx";
import { WindowFrame } from "./components/WindowFrame.jsx";
import { SkinRenderer } from "./components/SkinRenderer.jsx";
import { usePlayer } from "./hooks/usePlayer.js";
import { usePlaylist } from "./hooks/usePlaylist.js";
import { useEqualizer } from "./hooks/useEqualizer.js";
import { PlayerProvider, usePlayerStore } from "./store/playerStore.jsx";
import { STRINGS } from "./i18n/strings.js";
import { WINDOW_REGISTRY } from "./windowRegistry.js";
import "./styles/media-player.css";

export default function MediaPlayerRoot() {
  return (
    <PlayerProvider>
      <SkinRenderer skinId="classic">
        <MediaPlayerDesktop />
      </SkinRenderer>
    </PlayerProvider>
  );
}

function pickNextTrack(tracks, current, { shuffle, repeat }) {
  if (!tracks.length) return null;
  if (repeat === "one" && current) return current;
  if (shuffle) {
    const pool = tracks.filter((t) => t.id !== current?.id);
    const list = pool.length ? pool : tracks;
    return list[Math.floor(Math.random() * list.length)];
  }
  if (!current) return tracks[0];
  const idx = tracks.findIndex((t) => t.id === current.id);
  if (idx < 0) return tracks[0];
  if (idx + 1 < tracks.length) return tracks[idx + 1];
  return repeat === "all" ? tracks[0] : null;
}

function MediaPlayerDesktop() {
  const { state } = usePlayerStore();
  const playlist = usePlaylist();
  const playFnRef = useRef(null);

  const handleNeedNextTrack = useCallback(
    (current) => {
      const next = pickNextTrack(playlist.tracks, current, state);
      if (next) playFnRef.current?.(next, 0);
    },
    [playlist.tracks, state],
  );

  const player = usePlayer({ tracks: playlist.tracks, onNeedNextTrack: handleNeedNextTrack });
  playFnRef.current = player.play;

  const equalizer = useEqualizer(player.audioEngine);
  const [windows, setWindows] = useState(() => initWindows());
  const [compact, setCompact] = useState(false);
  const [focusedId, setFocusedId] = useState("player.main");
  const [queueInline, setQueueInline] = useState(true);

  const isWindowOpen = useCallback(
    (id) => {
      const w = windows.find((x) => x.id === id);
      return Boolean(w?.visible && !w?.minimized);
    },
    [windows],
  );

  const focus = useCallback((id) => {
    setFocusedId(id);
    setWindows((prev) => {
      const maxZ = Math.max(...prev.map((w) => w.zIndex), 0);
      return prev.map((w) => (w.id === id ? { ...w, zIndex: maxZ + 1 } : w));
    });
  }, []);

  const moveWindow = useCallback((id, rect) => {
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, rect } : w)));
  }, []);

  const resizeWindow = useCallback((id, rect) => {
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, rect } : w)));
  }, []);

  const finishResize = useCallback((id, rect) => {
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, rect } : w)));
  }, []);

  const toggleWindow = useCallback(
    (id) => {
      setWindows((prev) =>
        prev.map((w) => (w.id === id ? { ...w, visible: !w.visible, minimized: false } : w)),
      );
      focus(id);
    },
    [focus],
  );

  const openSound = useCallback(() => toggleWindow("player.eq"), [toggleWindow]);

  useEffect(() => {
    playlist.loadDemo();
  }, [playlist.loadDemo]);

  useEffect(() => {
    equalizer.applyPreset("normal");
  }, [equalizer.applyPreset]);

  const vizOpen = isWindowOpen("player.visualizer");
  const vizActive = vizOpen && player.isPlaying;

  const windowContent = useMemo(
    () => ({
      "player.main": (
        <>
          <MainWindow
            player={player}
            queueOpen={queueInline}
            onToggleQueue={() => setQueueInline((q) => !q)}
            onOpenSound={openSound}
            onToggleCompact={() => setCompact(true)}
          />
          <InlineQueue
            open={queueInline}
            tracks={playlist.tracks}
            currentId={player.currentTrack?.id}
            onSelect={(track) => player.play(track)}
          />
        </>
      ),
      "player.playlist": (
        <PlaylistWindow
          tracks={playlist.tracks}
          currentId={player.currentTrack?.id}
          onSelect={(track) => player.play(track)}
        />
      ),
      "player.eq": (
        <EqualizerWindow
          presets={equalizer.presets}
          presetId={equalizer.presetId}
          bands={equalizer.bands}
          onPreset={equalizer.applyPreset}
          onChange={equalizer.setBand}
          onReset={equalizer.reset}
        />
      ),
      "player.library": (
        <LibraryWindow tracks={playlist.tracks} onPlay={(t) => player.play(t)} />
      ),
      "player.visualizer": (
        <VisualizerWindow
          audioEngine={player.audioEngine}
          active={vizActive}
          isPlaying={player.isPlaying}
          hasTrack={Boolean(player.currentTrack)}
        />
      ),
    }),
    [player, playlist, equalizer, queueInline, openSound, vizActive],
  );

  if (compact) {
    return (
      <div className="dmp-desktop dmp-desktop--compact">
        <MiniPlayer player={player} onExpand={() => setCompact(false)} />
      </div>
    );
  }

  const optionalWindows = WINDOW_REGISTRY.filter((w) => !w.essential);

  return (
    <div className="dmp-desktop">
      <header className="dmp-toolbar">
        <div className="dmp-toolbar__brand">
          <strong>{STRINGS.appName}</strong>
          <span>{STRINGS.appSubtitle}</span>
        </div>
        <nav className="dmp-toolbar__nav" aria-label="Ventanas del reproductor">
          {optionalWindows.map((w) => {
            const open = isWindowOpen(w.id);
            return (
              <button
                key={w.id}
                type="button"
                className={`dmp-toolbar__btn${open ? " is-active" : ""}`}
                onClick={() => toggleWindow(w.id)}
                aria-pressed={open}
              >
                {w.title}
              </button>
            );
          })}
        </nav>
      </header>

      {windows
        .filter((w) => w.visible && !w.minimized)
        .sort((a, b) => a.zIndex - b.zIndex)
        .map((w) => (
          <WindowFrame
            key={w.id}
            id={w.id}
            title={w.title}
            rect={w.rect}
            zIndex={w.zIndex}
            focused={focusedId === w.id}
            onFocus={() => focus(w.id)}
            onMove={(rect) => moveWindow(w.id, rect)}
            onResize={(rect) => resizeWindow(w.id, rect)}
            onResizeEnd={(rect) => finishResize(w.id, rect)}
            onClose={() => toggleWindow(w.id)}
          >
            {windowContent[w.id]}
          </WindowFrame>
        ))}
    </div>
  );
}

function initWindows() {
  return WINDOW_REGISTRY.map((desc, i) => ({
    id: desc.id,
    title: desc.title,
    rect: { ...desc.defaultRect },
    visible: desc.defaultVisible ?? false,
    minimized: false,
    zIndex: i + 1,
  }));
}
