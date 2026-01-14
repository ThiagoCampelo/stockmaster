"use client";

import React, { useEffect, useRef } from 'react';

const Modal = ({ isOpen, onClose, title, children }) => {
    const modalRef = useRef(null);

    if (!isOpen) {
        return null;
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
        >
            <div
                ref={modalRef}
                className="relative w-full max-w-[800] mx-4 p-6 bg-slate-900 rounded-lg shadow-xl"
                onClick={(e) => e.stopPropagation()}
                tabIndex={-1}
            >

                {title && <h3 className="text-xl font-semibold text-white mb-4">{title}</h3>}

                <div className="text-gray-700 mb-4">
                    {children}
                </div>

            </div>
        </div>
    );
};

export default Modal;