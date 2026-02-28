import { useState, useEffect } from 'react';

const emotionColors: Record<string, { start: string; end: string }> = {
    // 8 Pillars
    PEAK_JOY: { start: '#0f172a', end: '#1e3a8a' },     // Subtle blue
    SERENITY: { start: '#0f172a', end: '#0c4a6e' },   // Subtle sky blue
    APPRECIATION: { start: '#0f172a', end: '#064e3b' },  // Subtle green
    OVERWHELMED: { start: '#0f172a', end: '#4a1a1a' }, // Deep ember 
    HOSTILITY: { start: '#0f172a', end: '#450a0a' },     // Subtle deep red
    DEJECTION: { start: '#0f172a', end: '#172554' },       // Subtle navy
    APATHY: { start: '#0f172a', end: '#1f2937' },     // Flat desaturated concrete blue-grey
    UNCERTAINTY: { start: '#0f172a', end: '#2c2c3e' }, // Shifting charcoal violet
    // Default
    Default: { start: '#0f172a', end: '#1e293b' },
};

function App() {
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const [feedback, setFeedback] = useState<{ emotion: string; text: string } | null>(null);

    // Update background function
    const setBackground = (emotion: string) => {
        const colors = emotionColors[emotion] || emotionColors.Default;
        document.documentElement.style.setProperty('--bg-color-start', colors.start);
        document.documentElement.style.setProperty('--bg-color-end', colors.end);
    };

    useEffect(() => {
        // Reset to default on mount
        setBackground('Default');
    }, []);

    const handleAnalyze = async () => {
        if (!text.trim()) return;
        setLoading(true);
        setFeedback(null);

        try {
            // Send to backend
            const res = await fetch('http://localhost:3001/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, user_id: 'local_user' }),
            });
            const data = await res.json();

            if (data.success) {
                const emo = data.data.emotion_type;
                setBackground(emo);

                // Use the backend-provided empathetic response driven by the 8 pillars
                const responseMsg = data.data.empathetic_response || `It sounds like you're feeling ${emo}. Recognizing how you feel is the first step.`;

                setFeedback({
                    emotion: emo,
                    text: responseMsg,
                });
            }
        } catch (err) {
            console.error(err);
            alert('Failed to connect to the Sentira engine.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="ambient-glow" />
            <div className="app-container">
                <h1>Sentira</h1>
                <div className="subtitle">An Emotional Mirror</div>

                <div className="input-area">
                    <textarea
                        placeholder="How are you feeling right now? Don't hold back..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        disabled={loading}
                    />
                    <button
                        className="analyze-button"
                        onClick={handleAnalyze}
                        disabled={loading || text.length === 0}
                    >
                        {loading ? 'Reflecting...' : 'Reflect'}
                    </button>
                </div>

                {feedback && (
                    <div className="feedback-container">
                        <p className="feedback-text">
                            {feedback.text}
                        </p>
                    </div>
                )}
            </div>
        </>
    );
}

export default App;
