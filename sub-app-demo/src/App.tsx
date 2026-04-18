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
    <div style={{ padding: 20, border: '2px dashed #3498db', height: '100%', boxSizing: 'border-box', backgroundColor: 'white' }}>
      <h3>Sub App Demo Dashboard</h3>
      <div>
        <input 
          type="text" 
          value={inputVal} 
          onChange={(e) => setInputVal(e.target.value)} 
          placeholder="Message to send" 
          style={{ padding: '4px', border: '1px solid #ccc', borderRadius: '4px' }}
        />
        <button onClick={sendMsg} style={{ marginLeft: 8, padding: '4px 12px' }}>Send Broadcast</button>
      </div>
      <div style={{ marginTop: 20 }}>
        <h4>Event Bus Messages received:</h4>
        <ul style={{ paddingLeft: 20 }}>
          {messages.map((m, i) => (
            <li key={i}>{m}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
