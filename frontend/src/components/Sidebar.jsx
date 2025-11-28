import { useState, useEffect } from 'react';
import './Sidebar.css';

export default function Sidebar({
  conversations,
  currentConversationId,
  onSelectConversation,
  onNewConversation,
  onBackToLanding,
}) {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <button className="back-to-landing" onClick={onBackToLanding} title="Back to Landing">
          <span className="back-icon">←</span>
        </button>
        <div className="brand">
          <span className="brand-prefix">DLM</span>
          <h1>LLM Council</h1>
        </div>
        <button className="new-conversation-btn" onClick={onNewConversation}>
          <span className="btn-icon">+</span>
          <span>New Session</span>
        </button>
      </div>

      <div className="conversation-list">
        {conversations.length === 0 ? (
          <div className="no-conversations">
            <div className="empty-icon">📜</div>
            <p>No deliberations yet</p>
            <span>Begin a new session to consult the Council</span>
          </div>
        ) : (
          conversations.map((conv) => (
            <div
              key={conv.id}
              className={`conversation-item ${
                conv.id === currentConversationId ? 'active' : ''
              }`}
              onClick={() => onSelectConversation(conv.id)}
            >
              <div className="conversation-title">
                {conv.title || 'New Deliberation'}
              </div>
              <div className="conversation-meta">
                {conv.message_count} {conv.message_count === 1 ? 'exchange' : 'exchanges'}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="sidebar-footer">
        <div className="council-badge">
          <span className="laurel">🏛️</span>
          <span>The Council Awaits</span>
        </div>
      </div>
    </div>
  );
}
