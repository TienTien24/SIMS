import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import authRoutes from './routes/auth-mock.js'; // Sử dụng mock database để test
import userRoutes from './routes/user.js'; // Thêm user routes

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sims'
const PORT = process.env.PORT || 4000

async function connectDatabase() {
	try {
		await mongoose.connect(MONGODB_URI)
		// eslint-disable-next-line no-console
		console.log('Connected to MongoDB')
		return true
	} catch (err) {
		// eslint-disable-next-line no-console
		console.error('MongoDB connection error:', err.message)
		return false
	}
}

app.get('/api/health', (_req, res) => {
	res.json({ 
		status: 'ok', 
		service: 'sims-backend',
		timestamp: new Date().toISOString(),
		uptime: process.uptime()
	})
})

// Error handling middleware
app.use((err, _req, res, _next) => {
	console.error(err.stack)
	res.status(500).json({ 
		error: 'Something went wrong!',
		message: err.message 
	})
})

// 404 handler
app.use((_req, res) => {
	res.status(404).json({ 
		error: 'Not found',
		message: 'The requested resource was not found' 
	})
})

app.listen(PORT, async () => {
	const isConnected = await connectDatabase()
	if (!isConnected) {
		console.error('Failed to connect to MongoDB. Server will continue running but database operations may fail.')
	}
	// eslint-disable-next-line no-console
	console.log(`API server listening on http://localhost:${PORT}`)
})


