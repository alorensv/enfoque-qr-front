import React from 'react';
import { QRCodeSVG as QRCode } from 'qrcode.react';

/**
 * Etiqueta compacta (miniatura) para pegar al costado de los equipos.
 * Formato vertical y reducido: QR arriba, nombre + N/S debajo, y el favicon
 * de Lortech (`/favion_lortech.png` en public) al pie. Pensada para poco
 * espacio físico.
 */
export default function EtiquetaEquipoCompacta({ nombre, numeroSerie, qrValue }) {
  return (
    <div style={{
      width: 180,
      background: '#fff',
      borderRadius: 6,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '10px 8px',
      fontFamily: 'sans-serif',
      border: '1px solid #ddd',
      textAlign: 'center'
    }}>
      <div style={{ padding: '4px', border: '1px solid #f0f0f0', borderRadius: '4px' }}>
        <QRCode value={qrValue} size={120} level="H" marginSize={0} />
      </div>
      <div style={{ fontWeight: 'bold', fontSize: '12px', color: '#222', lineHeight: '1.2', marginTop: '8px', overflowWrap: 'break-word', wordBreak: 'break-word', maxWidth: '100%' }}>{nombre}</div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginTop: '4px', maxWidth: '100%' }}>
        <span style={{ color: '#666', fontSize: '9px', flexShrink: 0 }}>N/S:</span>
        <span style={{ background: '#f0f0f0', borderRadius: '3px', padding: '2px 4px', fontSize: '9px', fontWeight: '500', color: '#444', lineHeight: '1.2', overflowWrap: 'break-word', wordBreak: 'break-word', minWidth: 0 }}>{numeroSerie}</span>
      </div>
      <img src="/favion_lortech.png" alt="Lortech" style={{ height: '22px', width: 'auto', objectFit: 'contain', marginTop: '8px' }} />
    </div>
  );
}
