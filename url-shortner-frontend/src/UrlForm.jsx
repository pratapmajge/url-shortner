import { useState } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:5000';

export default function UrlForm() {
  const [longUrl, setLongUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setShortUrl('');

    // quick client-side URL validation
    try {
      new URL(longUrl);
    } catch {
      setError('Please enter a valid URL (include https://)');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/shorten`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ longUrl })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Server error');

      setShortUrl(data.shortUrl);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!shortUrl) return;
    try {
      await navigator.clipboard.writeText(shortUrl);
      alert('Copied to clipboard');
    } catch {
      alert('Could not copy — please copy manually');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 720 }}>
      <input
        type="url"
        placeholder="https://example.com/very/long/url"
        value={longUrl}
        onChange={(e) => setLongUrl(e.target.value)}
        required
        style={{ width: '100%', padding: 10, marginBottom: 8 }}
      />
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="submit" disabled={loading}>
          {loading ? 'Shortening…' : 'Shorten'}
        </button>
        <button type="button" onClick={() => { setLongUrl(''); setShortUrl(''); setError(''); }}>
          Reset
        </button>
      </div>

      {error && <p style={{ color: 'crimson' }}>{error}</p>}

      {shortUrl && (
        <div style={{ marginTop: 12 }}>
          <p>
            Short URL: <a href={shortUrl} target="_blank" rel="noreferrer">{shortUrl}</a>
          </p>
          <button type="button" onClick={handleCopy}>Copy</button>
        </div>
      )}
    </form>
  );
}
