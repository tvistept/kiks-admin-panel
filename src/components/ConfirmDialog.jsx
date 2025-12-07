import React from 'react';
import '../styles/ConfirmDialog.css';

const ConfirmDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Подтверждение удаления",
  message = "Удалить этот элемент?",
  confirmText = "Удалить",
  cancelText = "Отмена"
}) => {
  if (!isOpen) return null;

  return (
    <div className="confirm-dialog-overlay">
      <div className="confirm-dialog">
        <div className="dialog-header">
          <h3 className="dialog-title">{title}</h3>
          <button 
            onClick={onClose} 
            className="dialog-close"
            aria-label="Закрыть"
          >
            <svg 
              viewBox="0 0 24 24" 
              fill="currentColor"
              width="20" 
              height="20"
            >
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>
        
        <div className="dialog-body">
          {/* <div className="dialog-icon">⚠️</div> */}
          <p className="dialog-message">{message}</p>
        </div>
        
        <div className="dialog-footer">
          <button 
            onClick={onClose} 
            className="dialog-button cancel"
          >
            {cancelText}
          </button>
          <button 
            onClick={onConfirm} 
            className="dialog-button confirm"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;