import React, { useState } from "react";
import imageCompression from 'browser-image-compression';
import { removeBg } from "./services/bgService";

const App = () => {
  // --- 1. ALL HOOKS AT THE TOP ---
  const [view, setView] = useState("landing");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [format, setFormat] = useState("image/jpeg");
  const [quality, setQuality] = useState(800);
  const [loading, setLoading] = useState(false);
  const [bgLoading, setBgLoading] = useState(false);
  const [bgProgress, setBgProgress] = useState(0);
  const [stats, setStats] = useState({ original: 0, optimized: 0 });

  // --- 2. LOGIC FUNCTIONS ---
  const handleFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setStats({ original: (file.size / 1024).toFixed(2), optimized: 0 });
    }
  };

  const handleStartCompression = async () => {
    if (!image) return;
    setLoading(true);

    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      initialQuality: quality / 1000,
      fileType: format,
    };

    try {
      const compressedFile = await imageCompression(image, options);
      const newSize = (compressedFile.size / 1024).toFixed(2);
      setStats(prev => ({ ...prev, optimized: newSize }));
      
      const url = URL.createObjectURL(compressedFile);
      const link = document.createElement('a');
      link.href = url;
      link.download = `xpress-${image.name.split('.')[0]}.${format.split('/')[1]}`;
      link.click();
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBackground = async () => {
    if (!image) return alert("Please upload an image first!");
    
    setBgLoading(true);
    try {
      const processedBlob = await removeBg(image, (p) => setBgProgress(p));
      const url = URL.createObjectURL(processedBlob);
      const noBgFile = new File([processedBlob], `no-bg-${image.name.split('.')[0]}.png`, { type: "image/png" });
      
      setPreview(url);
      setImage(noBgFile);
      setStats(prev => ({ ...prev, optimized: (noBgFile.size / 1024).toFixed(2) }));
      
      const link = document.createElement('a');
      link.href = url;
      link.download = noBgFile.name;
      link.click();
    } catch (err) {
      console.error(err);
      alert("AI Model Error. Ensure you're online for the initial download.");
    } finally {
      setBgLoading(false);
      setBgProgress(0);
    }
  };

  // --- 3. CONDITIONAL RENDERING ---
  if (view === "landing") {
    return (
      <div style={styles.landingContainer}>
        <div style={styles.heroCard}>
          <div style={styles.iconBox}>🖼️</div>
          <h1 style={styles.mainTitle}>Xpress Image Converter</h1>
          <p style={styles.subText}>Professional image compression and background removal without third-party APIs.</p>
          <button style={styles.getStartedBtn} onClick={() => setView("dashboard")}>Get Started</button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.dashboardContainer}>
      <header style={styles.header}>Xpress Image Converter</header>
      
      <div style={styles.topRow}>
        <div style={styles.featureCard}><div style={styles.badge}>Easy</div><span>📉</span><b>Compress Images</b><br/><p style={styles.cardDesc}>Reduce size and optimize for web.</p></div>
        <div style={styles.featureCard}><div style={styles.badge}>Easy</div><span>🔄</span><b>Convert Formats</b><br/><p style={styles.cardDesc}>JPEG, PNG, and AVIF support.</p></div>
        <div style={styles.featureCard}><div style={styles.badge}>Easy</div><span>📐</span><b>AI Powered</b><br/><p style={styles.cardDesc}>Local AI background removal.</p></div>
      </div>

      <div style={styles.mainGrid}>
        <div style={styles.sidebar}>
          <h3 style={{marginBottom: '20px', color: '#fff'}}>Settings</h3>
          
          <label style={styles.label}>Target Format</label>
          <select style={styles.input} value={format} onChange={(e) => setFormat(e.target.value)}>
            <option value="image/jpeg">JPEG</option>
            <option value="image/png">PNG</option>
            <option value="image/avif">AVIF</option>
          </select>
          
          <label style={styles.label}>Quality ({quality})</label>
          <input type="range" min="1" max="1000" value={quality} style={styles.slider} onChange={(e) => setQuality(e.target.value)} />
          
          <div style={styles.toggleRow}>
            <span>Lossy Compression</span>
            <input type="checkbox" defaultChecked />
          </div>

          <button 
            style={styles.bgRemoveBtn} 
            onClick={handleRemoveBackground}
            disabled={bgLoading}
          >
            {bgLoading ? `Processing... ${bgProgress}%` : "✨ Remove Background"}
          </button>
        </div>

        <div style={styles.workspace}>
          <div style={image?.name.includes('no-bg') ? styles.dropZoneTransparent : styles.dropZone}>
            {preview ? (
              <img src={preview} style={styles.previewImg} alt="preview" />
            ) : (
              <p style={{color: '#4b5563'}}>Drag & drop image or click to browse</p>
            )}
            <input type="file" style={styles.fileInput} onChange={handleFile} accept="image/*" />
          </div>
          
          <div style={styles.statBox}>
             <div><small>Original</small><br/>{stats.original} KB</div>
             <div><small>Optimized</small><br/><span style={{color: '#4ade80'}}>{stats.optimized || '--'} KB</span></div>
          </div>

          <button 
            style={stats.optimized > 0 ? styles.startBtnSuccess : styles.startBtn} 
            onClick={handleStartCompression} 
            disabled={!image || loading}
          >
            {loading ? "Processing..." : "Compress Image"}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- 4. STYLES OBJECT ---
const styles = {
  landingContainer: { backgroundColor: '#0a0e14', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif' },
  heroCard: { textAlign: 'center', padding: '60px', backgroundColor: '#111827', borderRadius: '32px', border: '1px solid #1f2937', maxWidth: '600px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' },
  iconBox: { backgroundColor: 'rgba(0,162,255,0.1)', width: '80px', height: '80px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', margin: '0 auto 24px', border: '1px solid rgba(0,162,255,0.2)' },
  mainTitle: { color: '#fff', fontSize: '3rem', fontWeight: '800', marginBottom: '16px', letterSpacing: '-0.02em' },
  subText: { color: '#9ca3af', fontSize: '1.125rem', lineHeight: '1.7', marginBottom: '40px' },
  getStartedBtn: { backgroundColor: '#00a2ff', color: 'white', border: 'none', padding: '16px 48px', borderRadius: '50px', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 0 25px rgba(0,162,255,0.4)', transition: 'transform 0.2s' },
  
  dashboardContainer: { backgroundColor: '#0a0e14', minHeight: '100vh', padding: '40px', color: '#fff', fontFamily: 'Inter, sans-serif' },
  header: { fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '32px' },
  topRow: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '40px' },
  featureCard: { backgroundColor: '#111827', padding: '24px', borderRadius: '20px', border: '1px solid #1f2937', position: 'relative' },
  cardDesc: { color: '#6b7280', fontSize: '0.85rem', marginTop: '8px' },
  badge: { position: 'absolute', top: '16px', right: '16px', backgroundColor: 'rgba(34,197,94,0.1)', color: '#4ade80', fontSize: '10px', fontWeight: 'bold', padding: '4px 10px', borderRadius: '20px', border: '1px solid rgba(34,197,94,0.2)' },
  mainGrid: { display: 'grid', gridTemplateColumns: '350px 1fr', gap: '32px' },
  sidebar: { backgroundColor: '#111827', padding: '32px', borderRadius: '24px', border: '1px solid #1f2937', alignSelf: 'start' },
  label: { display: 'block', color: '#6b7280', fontSize: '0.75rem', fontWeight: 'bold', marginTop: '24px', marginBottom: '8px', textTransform: 'uppercase' },
  input: { width: '100%', backgroundColor: '#0a0e14', border: '1px solid #374151', color: '#fff', padding: '12px', borderRadius: '12px', outline: 'none' },
  slider: { width: '100%', accentColor: '#00a2ff', marginTop: '8px' },
  toggleRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', color: '#d1d5db', fontSize: '0.9rem' },
  bgRemoveBtn: { width: '100%', marginTop: '20px', backgroundColor: '#1f2937', color: '#00a2ff', border: '1px solid #374151', padding: '14px', borderRadius: '12px', cursor: 'pointer', fontWeight: '600', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' },
  workspace: { display: 'flex', flexDirection: 'column', gap: '24px' },
  dropZone: { height: '320px', border: '2px dashed #374151', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', backgroundColor: 'rgba(17,24,39,0.5)' },
  dropZoneTransparent: {
    height: '320px', border: '2px solid #00a2ff', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden',
    backgroundImage: 'linear-gradient(45deg, #1a1a1a 25%, transparent 25%), linear-gradient(-45deg, #1a1a1a 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #1a1a1a 75%), linear-gradient(-45deg, transparent 75%, #1a1a1a 75%)',
    backgroundSize: '20px 20px', backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px', backgroundColor: '#111827'
  },
  fileInput: { position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer' },
  previewImg: { maxHeight: '90%', maxWidth: '90%', borderRadius: '12px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)' },
  statBox: { display: 'grid', gridTemplateColumns: '1fr 1fr', backgroundColor: '#111827', padding: '20px', borderRadius: '16px', border: '1px solid #1f2937', textAlign: 'center' },
  startBtn: { backgroundColor: '#00a2ff', color: '#fff', border: 'none', padding: '20px', borderRadius: '18px', fontWeight: '800', fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 4px 14px 0 rgba(0,162,255,0.39)' },
  startBtnSuccess: { backgroundColor: '#22c55e', color: '#fff', border: 'none', padding: '20px', borderRadius: '18px', fontWeight: '800', fontSize: '1.1rem', cursor: 'pointer' }
};

export default App;