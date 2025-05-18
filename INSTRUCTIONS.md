# Formulate - Setup Instructions

Follow these step-by-step instructions to set up and run the Formulate application.

## Prerequisites

1. Node.js (v14 or higher) and npm installed
2. MongoDB installed locally or a MongoDB Atlas account
3. Git installed

## Setup Steps

### 1. Clone the Repository

```bash
git clone <repository-url>
cd formulate
```

### 2. Set Up Backend Server

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create .env file with your configuration
# You can copy the content below and modify as needed
```

Create a `.env` file in the server directory with the following content:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/formulate
# For production, use a strong random string
JWT_SECRET=your_jwt_secret_key_change_in_production
NODE_ENV=development
```

```bash
# Start the server in development mode
npm run dev
```

### 3. Set Up Frontend Client

Open a new terminal window:

```bash
# Navigate to client directory from project root
cd client

# Install dependencies
npm install

# Create .env file for React
```

Create a `.env` file in the client directory with:

```
REACT_APP_API_URL=http://localhost:5000/api
```

```bash
# Start the React development server
npm start
```

## Accessing the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Default User Accounts

You will need to register a new account to use the application. Go to http://localhost:3000/register to create an account.

## MongoDB Setup

If you're using a local MongoDB, make sure MongoDB is running:

```bash
# Start MongoDB on Windows
net start MongoDB

# Start MongoDB on macOS/Linux
mongod
```

## Common Issues

1. **MongoDB Connection Error**: Make sure MongoDB is running and the connection string in `.env` is correct
2. **Port Already in Use**: If port 5000 or 3000 is already in use, change the port in the respective configurations
3. **CORS Issues**: If you see CORS errors, make sure both servers are running and the URL in the client's `.env` file is correct

## Building for Production

### Backend

```bash
cd server
npm start
```

### Frontend

```bash
cd client
npm run build
```

The build artifacts will be stored in the `client/build` directory, which can be served using any static file server. 