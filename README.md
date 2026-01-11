# Aircrew Transportation Management System

A comprehensive web application for managing airline flight crew transportation to and from airports.

## Features

### Management Dashboard
- Create, edit, and delete transportation jobs
- Schedule and assign drivers to jobs
- Filter jobs by status, driver, or date
- View all transportation requests with detailed information
- Edit key fields: Pickup Date/Time, Flight Number, Pickup/Dropoff Locations, Driver Assignment
- Track number of passengers, pickup/dropoff timestamps, and job status

### Driver Dashboard
- View assigned jobs only
- See job details: Pickup Date/Time, Flight Number, Locations, Number of Passengers
- Mark pickup time with automatic timestamp collection
- Mark dropoff time with automatic timestamp collection
- Check flight status via AviationStack API integration

### Flight Status Integration
- Real-time flight status lookup using AviationStack API
- Shows flight delays, scheduled/actual times, and current status

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Database**: SQLite (easily migratable to PostgreSQL)
- **Authentication**: JWT-based authentication
- **API Integration**: AviationStack API for flight status

## Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- Git (for version control)
- AviationStack API key (free tier available at https://aviationstack.com)

### Installation

1. **Clone the repository** (after creating it on GitHub):
   ```bash
   git clone <your-repo-url>
   cd aircrew-transportation-system
   ```

2. **Install dependencies**:
   ```bash
   # Install server dependencies
   cd server
   npm install
   
   # Install client dependencies
   cd ../client
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cd ../server
   cp .env.example .env
   ```

   Edit `server/.env` and add your AviationStack API key:
   ```env
   PORT=3001
   JWT_SECRET=your-secret-key-change-in-production
   AVIATIONSTACK_API_KEY=your-aviationstack-api-key-here
   NODE_ENV=development
   ```

   Get your free API key from: https://aviationstack.com/

### Running the Application

**Option 1: Run both together (recommended)**
```bash
# From project root
npm run dev
```

**Option 2: Run separately**

Terminal 1 (Backend):
```bash
cd server
npm run dev
```

Terminal 2 (Frontend):
```bash
cd client
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## Default Credentials

**Admin Account:**
- Email: `admin@transport.com`
- Password: `admin123`

*Note: The admin user is automatically created on first run. You can create additional driver accounts through the registration endpoint or by adding them directly to the database.*

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login user
- `POST /api/auth/register` - Register new user

### Jobs
- `GET /api/jobs` - Get all jobs (with optional filters: status, driverId, date)
- `GET /api/jobs/:id` - Get single job
- `POST /api/jobs` - Create new job
- `PUT /api/jobs/:id` - Update job
- `DELETE /api/jobs/:id` - Delete job
- `POST /api/jobs/:id/pickup` - Mark pickup time (driver only)
- `POST /api/jobs/:id/dropoff` - Mark dropoff time (driver only)

### Drivers
- `GET /api/drivers` - Get all drivers
- `GET /api/drivers/:id/jobs` - Get driver's assigned jobs

### Flights
- `GET /api/flights/status/:flightNumber` - Get flight status from AviationStack

### Locations
- `GET /api/locations` - Get all locations
- `POST /api/locations` - Create new location

## Database Schema

The application uses SQLite with the following tables:

- **jobs**: Transportation job records
- **drivers**: Driver/user accounts
- **locations**: Common pickup/dropoff locations

## Project Structure

```
.
├── server/                 # Backend Express server
│   ├── src/
│   │   ├── database.ts    # Database setup and models
│   │   ├── index.ts       # Server entry point
│   │   ├── middleware/    # Auth middleware
│   │   └── routes/        # API routes
│   ├── .env.example       # Environment variables template
│   └── package.json
├── client/                # Frontend React app
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── contexts/      # React contexts (Auth)
│   │   ├── pages/         # Page components
│   │   ├── types/         # TypeScript types
│   │   └── App.tsx        # Main app component
│   └── package.json
├── .gitignore            # Git ignore file
└── README.md             # This file
```

## Features in Detail

### Repeatable Scheduling
Jobs can be created with all necessary details and can be easily duplicated or scheduled repeatedly with the same or modified parameters.

### Driver Assignment
Managers can assign or reassign drivers to jobs via a dropdown selector. Jobs automatically update their status based on assignment.

### Real-time Tracking
Drivers can update job status by marking pickup and dropoff times, which are automatically timestamped and visible to management.

### Flight Status Integration
Both management and drivers can check flight status for any flight number, providing real-time updates on delays and schedule changes.

## Development Notes

- The database file (`transportation.db`) is created automatically on first run in the `server/` directory
- Default sample locations are pre-populated
- Authentication uses JWT tokens stored in localStorage
- All API requests from the frontend are proxied through Vite's dev server

## License

MIT

## Contributing

Feel free to submit issues and enhancement requests!