import React from 'react';

function ConfirmationModal({ isOpen, title, message, onConfirm, onCancel, confirmText = "Confirm", cancelText = "Cancel", isDestructive = false }) {
    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 10000,
            backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
            <div style={{
                backgroundColor: 'white', padding: '30px', borderRadius: '12px', maxWidth: '450px', width: '90%',
                boxShadow: '0 4px 25px rgba(0,0,0,0.15)', animation: 'slideIn 0.2s ease-out'
            }}>
                <h3 style={{ margin: '0 0 15px 0', color: '#333', fontSize: '1.2rem' }}>{title}</h3>
                <p style={{ margin: '0 0 25px 0', color: '#555', lineHeight: '1.5' }}>{message}</p>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px' }}>
                    {onCancel && (
                        <button
                            onClick={onCancel}
                            style={{ padding: '8px 16px', border: '1px solid #ccc', borderRadius: '6px', background: 'transparent', cursor: 'pointer', color: '#555', fontWeight: '500' }}
                        >
                            {cancelText}
                        </button>
                    )}
                    <button
                        onClick={onConfirm}
                        style={{ padding: '8px 16px', border: 'none', borderRadius: '6px', background: isDestructive ? '#d32f2f' : '#2e7d32', color: 'white', cursor: 'pointer', fontWeight: '500' }}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ConfirmationModal;
