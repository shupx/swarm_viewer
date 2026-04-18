import React, { useEffect, useRef, useState } from 'react';
import { loadMicroApp, MicroApp } from 'qiankun';
import { eventBus } from '../utils/bus';

interface MicroAppRendererProps {
  name: string;
  entry: string;
}

export const MicroAppRenderer: React.FC<MicroAppRendererProps> = ({ name, entry }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const microAppRef = useRef<MicroApp | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    try {
      setLoading(true);
      // Load the micro app manually
      microAppRef.current = loadMicroApp(
        {
          name: `${name}-${Math.random().toString(36).substring(7)}`, // Ensure unique name for multiple instances
          entry: entry,
          container: containerRef.current,
          props: {
            eventBus, // Inject event bus
          },
        },
        {
          sandbox: { strictStyleIsolation: false, experimentalStyleIsolation: true },
        }
      );

      microAppRef.current.mountPromise
        .then(() => setLoading(false))
        .catch((err) => {
          console.error(`Failed to mount ${name}:`, err);
          setError(err.message || 'Failed to manually mount micro app');
          setLoading(false);
        });

    } catch (err: any) {
      setError(err.message || 'Error loading micro app');
      setLoading(false);
    }

    return () => {
      // Unmount on cleanup
      if (microAppRef.current && microAppRef.current.getStatus() === 'MOUNTED') {
        microAppRef.current.unmount().catch(console.error);
      }
    };
  }, [name, entry]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {loading && <div style={{ position: 'absolute', top: 10, left: 10 }}>Loading {name}...</div>}
      {error && <div style={{ position: 'absolute', top: 10, left: 10, color: 'red' }}>Error: {error}</div>}
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};
