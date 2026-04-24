const fs = require('fs');
const file = './src/components/MicroAppRenderer.tsx';
let content = fs.readFileSync(file, 'utf8');

const anchor = `      microAppRef.current = loadMicroApp(
        {
          name: \`\${name}-\${Math.random().toString(36).substring(7)}\`, // Ensure unique name for multiple instances
          entry: entry,
          container: containerRef.current,
          props: {
            eventBus, // Inject event bus
          },
        },
        {
          sandbox: { strictStyleIsolation: false, experimentalStyleIsolation: true },
        }
      );`;

const rep = `      microAppRef.current = loadMicroApp(
        {
          name: \`\${name}-\${Math.random().toString(36).substring(7)}\`, // Ensure unique name for multiple instances
          entry: entry,
          container: containerRef.current,
          props: {
            eventBus, // Inject event bus
          },
        },
        {
          sandbox: { strictStyleIsolation: false, experimentalStyleIsolation: true },
          fetch: async (url: any, ...args: any[]) => {
            const urlStr = typeof url === 'string' ? url : url.url;
            if (urlStr === entry || urlStr === entry + '/') {
              const res = await window.fetch(url, ...args);
              const text = await res.text();
              const rand = Date.now() + Math.random().toString(36).substring(3);
              const bustedHTML = text.replace(/(\/src\/main\\.tsx)/g, \`$1?t=\${rand}\`);
              return new Response(bustedHTML, {
                status: res.status,
                statusText: res.statusText,
                headers: res.headers
              });
            }
            return window.fetch(url, ...args);
          }
        }
      );`;

content = content.replace(anchor, rep);
fs.writeFileSync(file, content, 'utf8');
console.log('patched renderer');
