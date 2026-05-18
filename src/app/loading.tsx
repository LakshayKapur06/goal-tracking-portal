import { Target } from "lucide-react";

export default function Loading() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      width: '100%',
      background: 'var(--background)',
      color: 'var(--foreground)'
    }}>
      <div className="pulse-animation" style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
        <Target size={64} color="var(--primary)" />
      </div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--primary)' }}>Loading Data...</h2>
      <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: '0.5rem' }}>Securely fetching your goals</p>
      
      <style>{`
        .pulse-animation {
          animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
}
