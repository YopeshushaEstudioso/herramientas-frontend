export function LoadingBlock({ label = "Cargando..." }: { label?: string }) {
  return (
    <div className="status-block status-block--loading" role="status">
      <span className="spinner" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

export function ErrorBlock({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="status-block status-block--error" role="alert">
      <span>{message}</span>
      {onRetry && (
        <button type="button" className="btn btn--ghost" onClick={onRetry}>
          Reintentar
        </button>
      )}
    </div>
  );
}

export function EmptyBlock({ message }: { message: string }) {
  return <div className="status-block status-block--empty">{message}</div>;
}
