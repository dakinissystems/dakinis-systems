import { memo } from "react";
import { STRINGS } from "../i18n/strings.js";

export const LibraryWindow = memo(function LibraryWindow({ tracks, onPlay }) {
  return (
    <div className="dmp-library">
      <div className="dmp-library__header">{STRINGS.library}</div>
      {tracks.length === 0 ? (
        <p className="dmp-playlist__empty">{STRINGS.queueEmpty}</p>
      ) : (
        <table className="dmp-library__table">
          <thead>
            <tr>
              <th>Título</th>
              <th>Artista</th>
              <th>Álbum</th>
            </tr>
          </thead>
          <tbody>
            {tracks.map((t) => (
              <tr
                key={t.id}
                onClick={() => onPlay(t)}
                onKeyDown={(e) => e.key === "Enter" && onPlay(t)}
                role="button"
                tabIndex={0}
              >
                <td>{t.title}</td>
                <td>{t.artist}</td>
                <td>{t.album ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
});
