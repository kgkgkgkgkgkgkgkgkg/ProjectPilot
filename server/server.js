const path = require('path');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const port = process.env.PORT || 3000;
const messageHistory = [];
let nextMessageId = 1;
const n8nWebhookUrl = String(process.env.N8N_WEBHOOK_URL || '').trim();
const requestTimeoutMs = Number.parseInt(process.env.REQUEST_TIMEOUT_MS || '10000', 10);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

function pushUpdate(update) {
    messageHistory.push({
        id: nextMessageId++,
        timestamp: Date.now(),
        ...update,
    });
}

function buildSimulatedResponse(message) {
    return [
        `ProjectPilot fallback: I received "${message}".`,
        'AI breakdown:',
        '1. Capture the goal',
        '2. Split into actionable tasks',
        '3. Assign ownership evenly',
        '4. Add a delivery checkpoint',
    ].join('\n');
}

function extractN8nResponse(payload) {
    if (!payload) {
        return '';
    }

    if (typeof payload === 'string') {
        return payload.trim();
    }

    if (Array.isArray(payload)) {
        const text = payload.map((item) => extractN8nResponse(item)).filter(Boolean).join('\n');
        return text.trim();
    }

    const candidateKeys = ['response', 'reply', 'text', 'message', 'output', 'result', 'content'];
    for (const key of candidateKeys) {
        if (payload[key]) {
            const value = extractN8nResponse(payload[key]);
            if (value) {
                return value;
            }
        }
    }

    if (payload.data) {
        const value = extractN8nResponse(payload.data);
        if (value) {
            return value;
        }
    }

    return '';
}

function normalizeResponseText(n8nPayload, fallbackMessage) {
    const text = extractN8nResponse(n8nPayload);
    if (text) {
        return text;
    }

    return fallbackMessage;
}

if (n8nWebhookUrl) {
    console.log(`✅ Connected to n8n: ${n8nWebhookUrl}`);
} else {
    console.warn('⚠️ No n8n URL');
}

app.post('/send-message', async (req, res) => {
    const text = String(req.body.text || '').trim();

    if (!text) {
        return res.status(400).json({ success: false, error: 'Message text is required.' });
    }

    console.log('➡️ /send-message request:', { text });

    try {
        if (!n8nWebhookUrl) {
            const fallback = buildSimulatedResponse(text);
            console.warn('⚠️ No n8n URL, using simulated response.');
            pushUpdate({
                from: 'bot',
                text: fallback,
            });

            return res.json({
                success: true,
                source: 'fallback',
                response: fallback,
            });
        }

        const n8nResponse = await axios.post(
            n8nWebhookUrl,
            { message: text },
            {
                timeout: requestTimeoutMs,
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
            }
        );

        console.log('⬅️ n8n response:', n8nResponse.data);

        const responseText = normalizeResponseText(
            n8nResponse.data,
            buildSimulatedResponse(text)
        );

        pushUpdate({
            from: 'bot',
            text: responseText,
        });

        return res.json({
            success: true,
            source: 'n8n',
            response: responseText,
        });
    } catch (error) {
        console.error('n8n webhook error:', error.message);

        const fallback = buildSimulatedResponse(text);
        pushUpdate({
            from: 'bot',
            text: fallback,
        });

        return res.json({
            success: true,
            source: 'fallback',
            warning: 'n8n request failed, used simulated response instead.',
            response: fallback,
        });
    }
});

app.get('/get-updates', (req, res) => {
    const updates = messageHistory.splice(0, messageHistory.length);
    res.json({ updates });
});

app.get('/health', (req, res) => {
    res.json({
        ok: true,
        n8nConfigured: Boolean(n8nWebhookUrl),
        n8nConnected: Boolean(n8nWebhookUrl),
        mode: n8nWebhookUrl ? 'n8n' : 'fallback',
    });
});

app.get('/status', (req, res) => {
    res.json({
        ok: true,
        port,
        n8nConfigured: Boolean(n8nWebhookUrl),
        mode: n8nWebhookUrl ? 'n8n' : 'fallback',
        n8nWebhookUrl: n8nWebhookUrl || null,
        ready: true,
    });
});

app.listen(port, () => {
    console.log(`ProjectPilot server running at http://localhost:${port}`);
});
