import express from 'express';
import cors from 'cors';
import { analyzeText, initNLP } from './services/nlp';
import { sequelize, Entry } from './db';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Main Endpoint: Capture Text and Returns Analysis
app.post('/api/analyze', async (req, res) => {
    try {
        const { text, user_id } = req.body;

        if (!text) {
            return res.status(400).json({ error: 'Text is required' });
        }

        // Run NLP Analysis
        const analysis = await analyzeText(text);

        // Save to Database
        const entry = await Entry.create({
            user_id: user_id || 'anonymous',
            raw_text: text,
            sentiment: analysis.sentiment,
            emotion_type: analysis.emotion_type,
            confidence: analysis.confidence,
        });

        res.json({
            success: true,
            data: {
                id: entry.id,
                text: text,
                sentiment: analysis.sentiment,
                emotion_type: analysis.emotion_type,
                confidence: analysis.confidence,
                raw_label: analysis.raw_label, // debug info
                empathetic_response: analysis.empathetic_response, // added per 8 Pillar schema
            }
        });

    } catch (err: any) {
        require('fs').writeFileSync('err.txt', String(err) + (err.stack || ''));
        console.error('Error during analysis:', err);
        res.status(500).json({ error: 'Internal server error while processing text' });
    }
});

// Endpoint to fetch history
app.get('/api/history', async (req, res) => {
    try {
        const entries = await Entry.findAll({
            order: [['createdAt', 'DESC']],
            limit: 50,
        });
        res.json({ success: true, data: entries });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(PORT, async () => {
    console.log(`Server is running on port ${PORT}`);
    console.log('Connecting to Database...');
    await sequelize.sync();
    console.log('Database synced.');

    // initialize NLP pipeline in background, so first request isn't terribly slow
    initNLP().catch(console.error);
});
