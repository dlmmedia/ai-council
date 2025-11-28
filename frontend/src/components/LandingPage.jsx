import { useState, useEffect } from 'react';
import './LandingPage.css';

// SVG Icons for each AI model
const GeminiIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="ai-logo">
    <path d="M12 2L9.5 9.5L2 12L9.5 14.5L12 22L14.5 14.5L22 12L14.5 9.5L12 2Z" />
    <circle cx="12" cy="12" r="2" fill="rgba(0,0,0,0.3)" />
  </svg>
);

const OpenAIIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="ai-logo">
    <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z"/>
  </svg>
);

const GrokIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="ai-logo">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const ClaudeIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="ai-logo">
    <path d="M4.709 15.955l4.72-2.647.08-.08 2.726-1.529.08-.08 6.007-3.37c.398-.239.558-.717.398-1.116-.08-.16-.16-.319-.32-.399l-.957-.558c-.399-.24-.878-.16-1.197.159l-2.646 2.248-3.205 2.726-.08.08-1.768 1.529-.08.08-4.242 3.603c-.398.32-.478.877-.239 1.276l.16.24.16.158c.318.32.797.4 1.196.16l-.793-.48zm14.582-.16l-4.72-2.646-.08-.08-2.726-1.53-.08-.079-6.007-3.37c-.399-.24-.558-.718-.399-1.117.08-.16.16-.319.32-.399l.957-.558c.399-.24.878-.16 1.197.16l2.646 2.247 3.205 2.726.08.08 1.768 1.53.08.079 4.242 3.603c.399.32.479.877.24 1.276l-.16.24-.16.159c-.319.32-.798.399-1.197.16l.794-.481z"/>
    <circle cx="12" cy="12" r="3" opacity="0.6"/>
  </svg>
);

function LandingPage({ onEnterCouncil }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animations after mount
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  return (
    <div className="landing-page">
      <div className="hero-overlay"></div>
      
      {/* Decorative elements */}
      <div className="pillar pillar-left"></div>
      <div className="pillar pillar-right"></div>
      
      <div className={`landing-content ${isVisible ? 'visible' : ''}`}>
        <div className="laurel-wreath">
          <svg viewBox="0 0 100 40" className="laurel-left">
            <path d="M50 35 Q30 30 20 20 Q15 10 25 5 Q35 15 40 25 Q45 30 50 35" fill="none" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M50 30 Q35 25 28 18 Q25 12 32 8 Q38 15 43 22 Q47 27 50 30" fill="none" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M50 25 Q40 22 35 16 Q33 12 38 10 Q42 14 46 19 Q48 22 50 25" fill="none" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
          <svg viewBox="0 0 100 40" className="laurel-right">
            <path d="M50 35 Q70 30 80 20 Q85 10 75 5 Q65 15 60 25 Q55 30 50 35" fill="none" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M50 30 Q65 25 72 18 Q75 12 68 8 Q62 15 57 22 Q53 27 50 30" fill="none" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M50 25 Q60 22 65 16 Q67 12 62 10 Q58 14 54 19 Q52 22 50 25" fill="none" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
        </div>

        <h1 className="landing-title">
          <span className="title-prefix">DLM</span>
          <span className="title-main">LLM Council</span>
        </h1>

        <p className="landing-subtitle">
          Where the Greatest Minds of Artificial Intelligence Convene
        </p>

        <div className="landing-description">
          <p>
            In the grand tradition of the Roman Senate, the wisest voices gather
            to deliberate upon your most challenging inquiries. Four titans of
            artificial intelligence — <strong>GPT 5.1</strong>, <strong>Claude Opus 4.5</strong>, 
            <strong> Gemini 3 Pro</strong>, and <strong>Grok 4.1</strong> — sit in council,
            each offering their wisdom before a Chairman synthesizes their collective insight.
          </p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">Ⅰ</div>
            <h3>First Opinions</h3>
            <p>Each councillor independently considers your query, delivering their initial wisdom</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">Ⅱ</div>
            <h3>Peer Review</h3>
            <p>The council reviews and ranks each response, debating merits in anonymous deliberation</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">Ⅲ</div>
            <h3>Final Verdict</h3>
            <p>The Chairman compiles all wisdom into a singular, comprehensive answer</p>
          </div>
        </div>

        <button className="enter-button" onClick={onEnterCouncil}>
          <span className="button-text">Enter the Council Chamber</span>
          <span className="button-icon">⟶</span>
        </button>

        <div className="council-members">
          <div className="member" title="Google Gemini 3 Pro">
            <div className="member-icon gemini">
              <GeminiIcon />
            </div>
            <span className="member-label">Gemini 3 Pro</span>
          </div>
          <div className="member" title="OpenAI GPT 5.1">
            <div className="member-icon openai">
              <OpenAIIcon />
            </div>
            <span className="member-label">GPT 5.1</span>
          </div>
          <div className="member" title="xAI Grok 4.1">
            <div className="member-icon grok">
              <GrokIcon />
            </div>
            <span className="member-label">Grok 4.1</span>
          </div>
          <div className="member" title="Anthropic Claude Opus 4.5">
            <div className="member-icon claude">
              <ClaudeIcon />
            </div>
            <span className="member-label">Claude Opus 4.5</span>
          </div>
        </div>

        <footer className="landing-footer">
          <p>Powered by OpenRouter • Multi-Model AI Deliberation</p>
        </footer>
      </div>
    </div>
  );
}

export default LandingPage;
