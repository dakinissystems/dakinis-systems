export function LibraryWindow({ tracks, onPlay }) {
  return (
    <div className="dmp-library">
      <div className="dmp-library__header">Biblioteca</div>
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
            <tr key={t.id} onDoubleClick={() => onPlay(t)} role="button" tabIndex={0}>
              <td>{t.title}</td>
              <td>{t.artist}</td>
              <td>{t.album}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
