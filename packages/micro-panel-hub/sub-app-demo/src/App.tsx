import { useEffect, useRef, useState } from 'react';
import './App.css';

interface EventBusLike {
  on: (type: string, handler: (event: unknown) => void) => void;
  off: (type: string, handler: (event: unknown) => void) => void;
  emit: (type: string, event?: unknown) => void;
}

interface SharedStateLike {
  get: <T = unknown>(key: string) => T | undefined;
  set: <T = unknown>(key: string, value: T) => void;
  subscribe: <T = unknown>(key: string, listener: (value: T | undefined) => void) => () => void;
  getAll: () => Record<string, unknown>;
}

const DEMO_SHARED_STATE_KEY = 'demo.sharedMessage';

function App({ eventBus, sharedState }: { eventBus?: EventBusLike; sharedState?: SharedStateLike }) {
  const [messages, setMessages] = useState<string[]>([]);
  const [inputVal, setInputVal] = useState('');
  const [messageLimit, setMessageLimit] = useState(100);
  const [messagesPaused, setMessagesPaused] = useState(false);
  const [sharedStateInput, setSharedStateInput] = useState('');
  const [sharedStateValue, setSharedStateValue] = useState('');
  const messagesListRef = useRef<HTMLUListElement | null>(null);
  const shouldStickToBottomRef = useRef(true);

  useEffect(() => {
    if (!eventBus) return;
    const handler = (msg: unknown) => {
      if (messagesPaused) {
        return;
      }
      setMessages((prev) =>
        [...prev, `${new Date().toLocaleTimeString()} - ${JSON.stringify(msg)}`].slice(-messageLimit),
      );
    };
    eventBus.on('message', handler);
    return () => {
      eventBus.off('message', handler);
    };
  }, [eventBus, messageLimit, messagesPaused]);

  useEffect(() => {
    setMessages((prev) => prev.slice(-messageLimit));
  }, [messageLimit]);

  useEffect(() => {
    if (!sharedState) {
      setSharedStateValue('');
      return;
    }

    const currentValue = sharedState.get<string>(DEMO_SHARED_STATE_KEY) ?? '';
    setSharedStateValue(currentValue);
    setSharedStateInput(currentValue);

    return sharedState.subscribe<string>(DEMO_SHARED_STATE_KEY, (value) => {
      setSharedStateValue(value ?? '');
    });
  }, [sharedState]);

  useEffect(() => {
    const list = messagesListRef.current;
    if (!list || !shouldStickToBottomRef.current) {
      return;
    }

    list.scrollTop = list.scrollHeight;
  }, [messages]);

  const handleMessagesScroll = () => {
    const list = messagesListRef.current;
    if (!list) {
      return;
    }

    const distanceFromBottom = list.scrollHeight - (list.scrollTop + list.clientHeight);
    shouldStickToBottomRef.current = distanceFromBottom <= 8;
  };

  const sendMsg = () => {
    if (eventBus) {
      eventBus.emit('message', { from: 'sub-app-demo', text: inputVal });
      setInputVal('');
    } else {
      alert('EventBus not injected!');
    }
  };

  const writeSharedState = () => {
    if (!sharedState) {
      alert('sharedState not injected!');
      return;
    }

    sharedState.set(DEMO_SHARED_STATE_KEY, sharedStateInput);
  };

  return (
    <div style={{ width: '100%', height: '100%', minHeight: '100%', boxSizing: 'border-box', backgroundColor: '#ffffff' }}>
      <div style={{ padding: '20px 20px 0', width: '100%', height: '100%', minHeight: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', width: '100%' }}>
          <h3 style={{ margin: 0, color: '#2c3e50', whiteSpace: 'nowrap' }}>Sub App Demo</h3>
          <div style={{ display: 'inline-flex', alignItems: 'center', height: '32px', padding: '0 10px', border: '1px solid #eee', borderRadius: '4px', background: '#f8fafc', color: '#475569', fontSize: '12px', whiteSpace: 'nowrap' }}>
            <strong style={{ color: '#334155' }}>sharedState</strong>: {DEMO_SHARED_STATE_KEY} = {sharedStateValue || '<empty>'}
          </div>
          <input
            type="text"
            value={sharedStateInput}
            onChange={(e) => setSharedStateInput(e.target.value)}
            placeholder={`Write ${DEMO_SHARED_STATE_KEY}`}
            style={{ flex: 1, minWidth: 0, height: '32px', padding: '0 10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px' }}
          />
          <button onClick={writeSharedState} style={{ height: '32px', padding: '0 12px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', whiteSpace: 'nowrap' }}>
            Set State
          </button>
        </div>
        <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', width: '100%' }}>
          <input 
            type="text" 
            value={inputVal} 
            onChange={(e) => setInputVal(e.target.value)} 
            placeholder="Broadcast a message" 
            style={{ flex: 1, minWidth: 0, height: '32px', padding: '0 10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px' }}
          />
          <button onClick={sendMsg} style={{ height: '32px', padding: '0 12px', background: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', whiteSpace: 'nowrap' }}>
            Send
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '8px' }}>
            <h4 style={{ margin: 0, color: '#7f8c8d', fontSize: '14px' }}>Event Bus Messages received:</h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#7f8c8d', fontSize: '13px' }}>
                Keep
                <input
                  type="number"
                  min={1}
                  step={1}
                  value={messageLimit}
                  onChange={(e) => {
                    const next = Number.parseInt(e.target.value, 10);
                    setMessageLimit(Number.isFinite(next) && next > 0 ? next : 1);
                  }}
                  style={{ width: '72px', padding: '4px 8px', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </label>
              <button
                type="button"
                title={messagesPaused ? 'Resume auto-updating messages' : 'Pause auto-updating messages'}
                onClick={() => setMessagesPaused((prev) => !prev)}
                style={{ padding: '4px 8px', border: '1px solid #ddd', borderRadius: '4px', background: messagesPaused ? '#fff7ed' : '#eef6ff', color: messagesPaused ? '#c2410c' : '#2563eb', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
              >
                {messagesPaused ? (
                  <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
                    <path d="M4 3.5v9l8-4.5-8-4.5Z" fill="currentColor" />
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
                    <rect x="3" y="3" width="3.5" height="10" rx="0.8" fill="currentColor" />
                    <rect x="9.5" y="3" width="3.5" height="10" rx="0.8" fill="currentColor" />
                  </svg>
                )}
              </button>
              <button
                type="button"
                onClick={() => setMessages([])}
                style={{ padding: '4px 10px', border: '1px solid #ddd', borderRadius: '4px', background: '#fff', color: '#555', cursor: 'pointer' }}
              >
                Clear
              </button>
            </div>
          </div>
          <ul
            ref={messagesListRef}
            onScroll={handleMessagesScroll}
            style={{ paddingLeft: 0, listStyle: 'none', margin: 0, fontSize: '13px', lineHeight: '16px', color: '#555', flex: 1, minHeight: 0, overflowY: 'auto', border: '1px solid #eee', borderRadius: '6px', background: '#fafafa' }}
          >
            {messages.map((m, i) => (
              <li key={i} style={{ padding: '8px 10px', borderBottom: '1px solid #eee', wordBreak: 'break-word' }}>{m}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;
