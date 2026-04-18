import { useState, useEffect } from 'react';
import './App.css';

function App({ eventBus }: { eventBus?: any }) {
  const [messages, setMessages] = useState<string[]>([]);
  const [inputVal, setInputVal] = useState('');

  useEffect(() => {
    if (!eventBus) return;
    const handler = (msg: any) => {
      setMessages((prev) => [...prev, `${new Date().toLocaleTimeString()} - ${JSON.stringify(msg)}`].slice(-5));
    };
    eventBus.on('message', handler);
    return () => {
      eventBus.off('message', handler);
    };
  }, [eventBus]);

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
      <div style={{ padding: '20px' }}>
        <h3 style={{ margin: '0 0 16px 0', color: '#2c3e50' }}>Sub App Dashboard</h3>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          <input 
            type="text" 
            value={inputVal} 
            onChange={(e) => setInputVal(e.target.value)} 
            placeholder="Broadcast a message" 
            style={{ flex: 1, padding: '6px 12px', border: '1px solid #ddd', borderRadius: '4px' }}
          />
          <button onClick={sendMsg} style={{ padding: '6px 16px', background: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Send
          </button>
        </div>
        <div>
          <h4 style={{ margin: '0 0 8px 0', color: '#7f8c8d', fontSize: '14px' }}>Event Bus Messages received:</h4>
          <ul style={{ paddingLeft: 0, listStyle: 'none', margin: 0, fontSize: '13px', color: '#555' }}>
            {messages.map((m, i) => (
              <li key={i} style={{ padding: '4px 0', borderBottom: '1px solid #eee' }}>{m}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;
