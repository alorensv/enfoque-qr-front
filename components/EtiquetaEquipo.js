import React from 'react';
import QRCode from 'qrcode.react';

export default function EtiquetaEquipo({ nombre, numeroSerie, qrValue, logoUrl }) {
  return (
    <div style={{
      width: 400,
      height: 180,
      background: '#fff',
      borderRadius: 10,
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      padding: '16px',
      fontFamily: 'sans-serif',
      border: '1px solid #eee'
    }}>
      <div style={{ padding: '8px', border: '1px solid #f0f0f0', borderRadius: '8px', marginRight: '16px' }}>
        <QRCode value={qrValue} size={140} level="H" includeMargin={false} />
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-around', height: '100%', minWidth: 0 }}>
        <div style={{ width: '100%' }}>
          <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#333', lineHeight: '1.3', marginBottom: '12px', overflowWrap: 'break-word', wordBreak: 'break-word', whiteSpace: 'normal' }}>{nombre}</div>
          <div style={{ display: 'flex', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <span style={{ color: '#555', fontSize: '14px', marginRight: '6px', flexShrink: 0 }}>N/S:</span>
            <span style={{ background: '#f0f0f0', borderRadius: '4px', padding: '4px 8px', fontSize: '13px', fontWeight: '500', color: '#444', overflowWrap: 'break-word', wordBreak: 'break-word', flex: 1, minWidth: 0 }}>{numeroSerie}</span>
          </div>
        </div>
        <div style={{ alignSelf: 'flex-start', marginTop: '16px' }}>
          <img src={logoUrl} alt="Logo" style={{ maxHeight: '45px', maxWidth: '150px', objectFit: 'contain' }} />
        </div>
      </div>
    </div>
  );
}
