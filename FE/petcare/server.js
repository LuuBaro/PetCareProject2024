import express from 'express';
import { WebSocketServer } from 'ws'; // Import WebSocketServer from 'ws'
import multer from 'multer';
import { Storage } from '@google-cloud/storage';
import fs from 'fs';
import http from 'http'; // Required to combine WebSocket with Express
import cors from 'cors'; // Import cors
import path from 'path';

// Express app setup
const app = express();
const server = http.createServer(app); // Use HTTP server to support both WebSocket and Express

// CORS setup
const corsOptions = {
    origin: ["http://localhost:5173", "https://yourdomain.com"], // Adjust your allowed origins
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    maxAge: 3600,
};

app.use(cors(corsOptions)); // Apply CORS middleware

// WebSocket Server setup
const wss = new WebSocketServer({ server }); // Attach WebSocket server to HTTP server

console.log("WebSocket server is running on ws://localhost:8081");

wss.on('connection', (ws) => {
    console.log('A new client connected.');

    ws.on('message', (message) => {
        console.log('Received:', message);

        // Send the message to all clients except the sender
        wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === ws.OPEN) {
                client.send(message);
            }
        });
    });

    ws.on('close', () => {
        console.log('A client disconnected.');
    });
});

// Google Cloud Storage setup
const storage = new Storage();
const bucketName = 'your-gcs-bucket-name'; // Replace with your GCS bucket name
const bucket = storage.bucket(bucketName);

// Multer setup for file uploads
const upload = multer({ dest: 'uploads/' });

// POST endpoint for file upload
app.post('/upload', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    try {
        const filePath = req.file.path;
        const gcsFileName = `${Date.now()}_${req.file.originalname}`;
        const gcsFile = bucket.file(gcsFileName);

        await gcsFile.save(req.file.buffer, {
            contentType: req.file.mimetype,
            public: true,
        });

        const publicUrl = `https://storage.googleapis.com/${bucketName}/${gcsFileName}`;
        res.status(200).json({ url: publicUrl });

        fs.unlinkSync(filePath); // Clean up the temporary file
    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).json({ message: 'Failed to upload file.' });
    }
});

// Start the server on port 8081
const PORT = process.env.PORT || 8081;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
