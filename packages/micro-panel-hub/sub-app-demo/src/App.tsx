import { useEffect, useRef, useState } from 'react';
import './App.css';

interface EventBusLike {
  on: (type: string, handler: (event: unknown) => void) => void;
  off: (type: string, handler: (event: unknown) => void) => void;
  emit: (type: string, event?: unknown) => void;
}

function App({ eventBus }: { eventBus?: EventBusLike }) {
  const [messages, setMessages] = useState<string[]>([]);
  const [inputVal, setInputVal] = useState('');
  const [messageLimit, setMessageLimit] = useState(100);
  const messagesListRef = useRef<HTMLUListElement | null>(null);
  const shouldStickToBottomRef = useRef(true);

  useEffect(() => {
    if (!eventBus) return;
    const handler = (msg: unknown) => {
      setMessages((prev) =>
        [...prev, `${new Date().toLocaleTimeString()} - ${JSON.stringify(msg)}`].slice(-messageLimit),
      );
    };
    eventBus.on('message', handler);
    return () => {
      eventBus.off('message', handler);
    };
  }, [eventBus, messageLimit]);

  useEffect(() => {
    setMessages((prev) => prev.slice(-messageLimit));
  }, [messageLimit]);

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

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', boxSizing: 'border-box', backgroundColor: '#ffffff' }}>
      <div style={{ padding: '20px', width: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
        <h3 style={{ margin: '0 0 16px 0', color: '#2c3e50' }}>Sub App Dashboard</h3>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', width: '100%' }}>
          <input 
            type="text" 
            value={inputVal} 
            onChange={(e) => setInputVal(e.target.value)} 
            placeholder="Broadcast a message" 
            style={{ flex: 1, minWidth: 0, padding: '6px 12px', border: '1px solid #ddd', borderRadius: '4px' }}
          />
          <button onClick={sendMsg} style={{ padding: '6px 16px', background: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
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
            style={{ paddingLeft: 0, listStyle: 'none', margin: 0, fontSize: '13px', color: '#555', flex: 1, minHeight: 0, overflowY: 'auto', border: '1px solid #eee', borderRadius: '6px', background: '#fafafa' }}
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
