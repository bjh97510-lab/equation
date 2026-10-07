import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

export function Button({ children, variant = 'primary', size = '', block = false, to, className = '', ...rest }) {
  const cls = `btn btn-${variant} ${size ? `btn-${size}` : ''} ${block ? 'btn-block' : ''} ${className}`;
  if (to) {
    return (
      <Link to={to} className={cls} {...rest}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" className={cls} {...rest}>
      {children}
    </button>
  );
}

export function Card({ children, className = '', soft = false, ...rest }) {
  return (
    <div className={`card ${soft ? 'soft' : ''} ${className}`} {...rest}>
      {children}
    </div>
  );
}

export function ProgressBar({ value = 0, label, right, brown = false }) {
  const v = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div>
      {(label || right) && (
        <div className="progress-label">
          <span>{label}</span>
          <span>{right ?? `${v}%`}</span>
        </div>
      )}
      <div className="progress" role="progressbar" aria-valuenow={v} aria-valuemin={0} aria-valuemax={100}>
        <span style={{ width: `${v}%` }} className={brown ? 'brown' : ''} />
      </div>
    </div>
  );
}

export function Chip({ children, tone = '' }) {
  return <span className={`chip ${tone}`}>{children}</span>;
}

export function Modal({ open, onClose, children, wide = false }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div className={`modal ${wide ? 'wide' : ''}`} role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

export function Loading({ text = '🌳 수학 숲으로 들어가는 중...' }) {
  return (
    <div className="loading" role="status" aria-live="polite">
      <div className="spin">🌰</div>
      <div>{text}</div>
    </div>
  );
}

export function EmptyState({ emoji = '🌱', title, desc, action }) {
  return (
    <div className="card center" style={{ padding: 36 }}>
      <div style={{ fontSize: '2.6rem' }}>{emoji}</div>
      <h3>{title}</h3>
      {desc && <p className="muted">{desc}</p>}
      {action}
    </div>
  );
}

export function PageTitle({ title, sub, right }) {
  return (
    <>
      <div className="page-title">
        <h1>{title}</h1>
        {right}
      </div>
      {sub && <p className="subtitle">{sub}</p>}
    </>
  );
}
