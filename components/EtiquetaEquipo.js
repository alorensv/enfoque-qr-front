import React from 'react';
import QRCode from 'qrcode.react';

export default function EtiquetaEquipo({ nombre, numeroSerie, qrValue, logoUrl }) {
  return (
    <div style={{
      width: 400,
      height: 160,
      background: '#fff',
      borderRadius: 8,
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      padding: '12px',
      fontFamily: 'sans-serif',
      border: '1px solid #eee'
    }}>
      <div style={{ padding: '6px', border: '1px solid #f0f0f0', borderRadius: '6px', marginRight: '12px' }}>
        <QRCode value={qrValue} size={130} level="H" includeMargin={false} />
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-around', height: '100%', minWidth: 0 }}>
        <div style={{ width: '100%' }}>
          <div style={{ fontWeight: 'bold', fontSize: '13px', color: '#333', lineHeight: '1.2', marginBottom: '10px', overflowWrap: 'break-word', wordBreak: 'break-word', whiteSpace: 'normal' }}>{nombre}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ color: '#555', fontSize: '10px', flexShrink: 0 }}>N/S:</span>
            <span style={{ background: '#f0f0f0', borderRadius: '4px', padding: '4px 4px', fontSize: '11px', fontWeight: '500', color: '#444', lineHeight: '1.3', display: 'inline-block', maxWidth: '100%', overflowWrap: 'break-word', wordBreak: 'break-word' }}>{numeroSerie}</span>
          </div>
        </div>
        <div style={{ alignSelf: 'flex-start', marginTop: '12px' }}>
          <img src={logoUrl} alt="Logo" style={{ maxHeight: '40px', maxWidth: '140px', objectFit: 'contain' }} />
        </div>
      </div>
    </div>
  );
}
