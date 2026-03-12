import { useState, useRef } from 'react';
import Tesseract from 'tesseract.js';
import { Camera, Upload, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function OCRScanner({ onTextExtracted, onClose }) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState(null);
    const [preview, setPreview] = useState(null);
    const fileInputRef = useRef(null);

    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Show preview
        const reader = new FileReader();
        reader.onload = (e) => setPreview(e.target.result);
        reader.readAsDataURL(file);

        setIsProcessing(true);
        setError(null);
        setProgress(0);

        try {
            const worker = await Tesseract.createWorker({
                logger: m => {
                    if (m.status === 'recognizing text') {
                        setProgress(Math.round(m.progress * 100));
                    }
                }
            });

            // Load Korean and English
            await worker.loadLanguage('kor+eng');
            await worker.initialize('kor+eng');

            const { data: { text } } = await worker.recognize(file);
            await worker.terminate();

            if (text.trim()) {
                onTextExtracted(text);
            } else {
                setError('텍스트를 인식하지 못했습니다. 더 선명한 사진을 올려주세요.');
            }
        } catch (err) {
            console.error('OCR Error:', err);
            setError('이미지 처리 중 오류가 발생했습니다.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="glass-card" style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '90%',
            maxWidth: '500px',
            zIndex: 100,
            padding: 'var(--space-xl)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-md)'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Camera size={20} className="text-gradient" />
                    <span>메모 스캔하기</span>
                </h3>
                <button className="btn-icon" onClick={onClose} disabled={isProcessing}>✕</button>
            </div>

            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9375rem' }}>
                종이책에 연필로 적은 메모나 밑줄 친 문장을 사진으로 업로드하면 텍스트로 자동 변환됩니다. (한국어, 영어 지원)
            </p>

            {/* Upload Area */}
            <div
                onClick={() => !isProcessing && fileInputRef.current?.click()}
                style={{
                    border: `2px dashed ${preview ? 'transparent' : 'var(--color-border)'}`,
                    borderRadius: 'var(--radius-lg)',
                    padding: preview ? '0' : 'var(--space-xl)',
                    textAlign: 'center',
                    cursor: isProcessing ? 'not-allowed' : 'pointer',
                    background: preview ? 'transparent' : 'rgba(0,0,0,0.2)',
                    transition: 'all var(--transition-fast)',
                    position: 'relative',
                    overflow: 'hidden',
                    minHeight: '200px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    disabled={isProcessing}
                />

                {preview ? (
                    <img src={preview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'contain', opacity: isProcessing ? 0.5 : 1 }} />
                ) : (
                    <div style={{ color: 'var(--color-text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-sm)' }}>
                        <Upload size={32} />
                        <span>클릭하여 사진 업로드</span>
                    </div>
                )}

                {/* Processing Overlay */}
                {isProcessing && (
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'rgba(15, 17, 21, 0.7)',
                        backdropFilter: 'blur(4px)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 'var(--space-sm)'
                    }}>
                        <Loader2 size={32} className="text-gradient" style={{ animation: 'spin 2s linear infinite' }} />
                        <span style={{ fontWeight: 500, color: 'var(--color-primary)' }}>텍스트 추출 중... {progress}%</span>
                    </div>
                )}
            </div>

            {error && (
                <div style={{ padding: 'var(--space-sm)', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-error)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                    <AlertCircle size={16} />
                    <span>{error}</span>
                </div>
            )}

            {progress === 100 && !error && !isProcessing && (
                <div style={{ padding: 'var(--space-sm)', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--color-success)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                    <CheckCircle2 size={16} />
                    <span>추출 완료!</span>
                </div>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}} />
        </div>
    );
}
