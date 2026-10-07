import React from 'react';

/**
 * 예상치 못한 오류가 발생해도 빈 화면 대신 안내 화면을 보여준다.
 * 학습 데이터는 이미 localStorage 에 저장되어 있으므로 안전하다.
 */
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error('[ErrorBoundary]', error, info);
  }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="error-page card">
        <div style={{ fontSize: '2.6rem' }}>🌳</div>
        <h2>잠시 길을 잃었어요.</h2>
        <p className="muted">학습 기록은 최대한 안전하게 보관했습니다.</p>
        <p className="small muted" style={{ wordBreak: 'break-all' }}>
          {String(this.state.error?.message || this.state.error)}
        </p>
        <div className="btn-row center">
          <button type="button" className="btn btn-primary" onClick={() => this.setState({ error: null })}>
            🔄 다시 시도
          </button>
          <a className="btn btn-secondary" href="#/">
            🏠 홈으로
          </a>
        </div>
      </div>
    );
  }
}
