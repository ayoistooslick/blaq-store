import { useMemo } from 'react';
import twemoji from 'twemoji';

export default function Twemoji({ text, style, className }) {
  const parsed = useMemo(() => {
    if (!text) return '';
    return twemoji.parse(String(text), {
      folder: 'svg',
      ext: '.svg',
      base: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/',
      attributes: () => ({ style: 'height:1.1em;width:1.1em;vertical-align:-0.15em;display:inline-block;' }),
    });
  }, [text]);

  return (
    <span
      className={className}
      style={style}
      dangerouslySetInnerHTML={{ __html: parsed }}
    />
  );
}
