import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AudioEngine } from "../services/audioEngine.js";
import { usePlayerStore } from "../store/playerStore.jsx";

const POSITION_TICK_MS = 250;

export function usePlayer({ tracks = [], onNeedNextTrack } = {}) {
  const { state, dispatch } = usePlayerStore();
  const engineRef = useRef(null);
  if (!engineRef.current) engineRef.current = new AudioEngine();

  const [currentTrack, setCurrentTrack] = useState(null);
  const [buffer, setBuffer] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [positionMs, setPositionMs] = useState(0);
  const [loading, setLoading] = useState(false);
  const bufferRef = useRef(null);
  bufferRef.current = buffer;

  const audioEngine = engineRef.current;
  const currentTrackRef = useRef(null);
  currentTrackRef.current = currentTrack;

  useEffect(() => {
    audioEngine.setVolume(state.volume);
  }, [audioEngine, state.volume]);

  useEffect(() => {
    audioEngine.onEnded = () => {
      setIsPlaying(false);
      onNeedNextTrack?.(currentTrackRef.current);
    };
    return () => {
      audioEngine.onEnded = null;
    };
  }, [audioEngine, onNeedNextTrack]);

  useEffect(() => {
    if (!isPlaying) return undefined;
    const id = setInterval(() => {
      setPositionMs(Math.floor(audioEngine.getCurrentTime() * 1000));
    }, POSITION_TICK_MS);
    return () => clearInterval(id);
  }, [audioEngine, isPlaying]);

  const play = useCallback(
    async (track, seekSec = 0) => {
      if (!track?.sourceRef) return;
      setLoading(true);
      try {
        await audioEngine.ensureContext();
        const decoded =
          track.sourceRef && bufferRef.current && currentTrack?.id === track.id && seekSec === 0
            ? bufferRef.current
            : await audioEngine.loadUrl(track.sourceRef);
        setBuffer(decoded);
        setCurrentTrack(track);
        audioEngine.playBuffer(decoded, seekSec);
        setIsPlaying(true);
        setPositionMs(Math.floor(seekSec * 1000));
      } catch (err) {
        console.error("[dmp] play failed", err);
      } finally {
        setLoading(false);
      }
    },
    [audioEngine, currentTrack?.id],
  );

  const togglePlay = useCallback(async () => {
    if (!currentTrack) return;
    if (!bufferRef.current && currentTrack.sourceRef) {
      await play(currentTrack);
      return;
    }
    if (!bufferRef.current) return;
    if (isPlaying) {
      audioEngine.pause();
      setIsPlaying(false);
    } else {
      await audioEngine.ensureContext();
      audioEngine.playBuffer(bufferRef.current, positionMs / 1000);
      setIsPlaying(true);
    }
  }, [audioEngine, currentTrack, isPlaying, positionMs, play]);

  const stop = useCallback(() => {
    audioEngine.stop();
    setIsPlaying(false);
    setPositionMs(0);
  }, [audioEngine]);

  const seek = useCallback(
    async (ms) => {
      if (!bufferRef.current || !currentTrack) return;
      const clamped = Math.max(0, Math.min(ms, currentTrack.durationMs || ms));
      await audioEngine.ensureContext();
      audioEngine.playBuffer(bufferRef.current, clamped / 1000);
      setPositionMs(clamped);
      setIsPlaying(true);
    },
    [audioEngine, currentTrack],
  );

  const playNext = useCallback(() => {
    if (!tracks.length || !currentTrack) return;
    const idx = tracks.findIndex((t) => t.id === currentTrack.id);
    const nextIdx = idx < 0 ? 0 : (idx + 1) % tracks.length;
    play(tracks[nextIdx], 0);
  }, [tracks, currentTrack, play]);

  const playPrevious = useCallback(() => {
    if (!tracks.length || !currentTrack) return;
    const idx = tracks.findIndex((t) => t.id === currentTrack.id);
    const prevIdx = idx <= 0 ? tracks.length - 1 : idx - 1;
    play(tracks[prevIdx], 0);
  }, [tracks, currentTrack, play]);

  const setVolume = useCallback((v) => dispatch({ type: "SET_VOLUME", payload: v }), [dispatch]);

  return useMemo(
    () => ({
      audioEngine,
      currentTrack,
      isPlaying,
      loading,
      positionMs,
      volume: state.volume,
      play,
      togglePlay,
      stop,
      seek,
      playNext,
      playPrevious,
      setVolume,
    }),
    [
      audioEngine,
      currentTrack,
      isPlaying,
      loading,
      positionMs,
      state.volume,
      play,
      togglePlay,
      stop,
      seek,
      playNext,
      playPrevious,
      setVolume,
    ],
  );
}
