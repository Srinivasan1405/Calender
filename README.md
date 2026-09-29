# Routine Success Tracker

A full-stack web application for planning, tracking, and analyzing daily routines with goals and performance insights.

## Features

- **User Authentication**: Secure JWT-based signup/login system
- **Daily Routine Tracker**: Fixed time slots from 6:00 AM to 10:00 PM
- **Default Routine Template**: Auto-filled daily from user-defined template
- **Performance Tracking**: Daily success rate calculation
- **Graph Dashboard**: Line charts, bar charts, pie charts, and calendar heatmap
- **Notes System**: Daily notes with mood tracking
- **Goals System**: Yearly and monthly goals with progress tracking
- **Streak System**: Track consecutive successful days (80%+ completion)
- **Dark Mode**: Toggle between light and dark themes
- **Responsive Design**: Mobile and desktop friendly

## Tech Stack

- **Frontend**: React.js, Tailwind CSS, Recharts
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT with bcrypt

## Project Structure

```
routine-success-tracker/
├── server/                    # Backend API (Node.js + Express)
│   ├── src/
│   │   ├── models/           # Mongoose schemas (User, Task, Note, Goal, DailyStats)
│   │   ├── routes/           # API routes (auth, tasks, notes, goals, performance)
│   │   ├── middleware/        # JWT authentication middleware
│   │   └── index.js          # Express server entry point
│   ├── package.json
│   └── .env
├── client/                     # Frontend (React + Tailwind)
│   ├── src/
│   │   ├── components/       # CalendarHeatmap, WeeklySummary, GoalProgressCard, etc.
│   │   ├── pages/            # Dashboard, RoutineTracker, Goals, Analytics
│   │   ├── context/          # AuthContext
│   │   ├── utils/            # API client, helpers
│   │   └── App.js
│   ├── public/
│   ├── package.json
│   └── tailwind.config.js
├── package.json               # Root package with concurrently
└── README.md
```

## Quick Start

### 1. Install Dependencies

```bash
# Install root dependencies (concurrently)
npm install

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

Or use the shortcut:

```bash
npm run install:all
```

### 2. Configure Environment

**Server (.env):**
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/routine_tracker
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
```

**Client (.env):**
```
REACT_APP_API_URL=http://localhost:5000/api
```

### 3. Start Development

```bash
# Start both server and client
npm run dev

# Or run them separately:
npm run server   # Backend on http://localhost:5000
npm run client   # Frontend on http://localhost:3000
```

### 4. Build for Production

```bash
npm run build
```

### 5. Seed Sample Data (Optional)

```bash
npm run seed
```

Test accounts:
- Email: `john@example.com` | Password: `password123`
- Email: `jane@example.com` | Password: `password123`

## Deploy to Vercel (Recommended)

1. Fork or push this repo to your GitHub (this setup pushes to `https://github.com/Srinivasan1405/Calender.git`).
2. Create a [MongoDB Atlas](https://www.mongodb.com/atlas) free cluster and copy the connection string (use `mongodb+srv://...`).
3. Go to [Vercel](https://vercel.com/) → Import the repo → Create Project.
4. **Project settings (important):**
   - Root Directory = repository root (leave blank). If you set it to `client`, `api/` and `server/` are excluded from the deployment and the API 404s.
   - Framework Preset = `Other`
5. Add Environment Variables (for Production, Preview and Development):
   - `MONGO_URI` = your Atlas connection string
   - `JWT_SECRET` = a long random string (e.g. `openssl rand -base64 32`)
   - `OPENAI_API_KEY` = optional (chat falls back to canned replies)
6. Deploy.
7. Verify the API is live before using the app:
   - `https://<project>.vercel.app/api/health` must return JSON (not the HTML page). It also lists any missing env vars in `missingEnv`.

**Local dev notes:** The client points to `http://localhost:8080/api` by default in `client/.env.example`. For local runs, `npm run dev` uses `concurrently` and launches Express on 8080 + React on 3000.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/default-routine` - Update default routine template

### Tasks
- `POST /api/tasks` - Create/update tasks for a date
- `GET /api/tasks/:date` - Get tasks for a specific date
- `PUT /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task

### Notes
- `POST /api/notes` - Create/update a note
- `GET /api/notes/:date` - Get note for a specific date
- `GET /api/notes` - Get all notes

### Goals
- `POST /api/goals` - Create a new goal
- `GET /api/goals` - Get all goals (optional: `?type=yearly|monthly`)
- `PUT /api/goals/:id` - Update a goal
- `DELETE /api/goals/:id` - Delete a goal

### Performance
- `GET /api/performance/daily` - Get daily performance stats
- `GET /api/performance/weekly` - Get weekly performance stats
- `GET /api/performance/stats` - Get overall statistics
- `GET /api/performance/heatmap` - Get heatmap data

## Default Routine Template

New users get this template auto-filled:

| Time | Task |
|------|------|
| 06:00 | Morning Exercise |
| 07:00 | Breakfast |
| 08:00 | Work/Study |
| 09:00 | Deep Work Session |
| 10:00 | Break |
| 11:00 | Work/Study |
| 12:00 | Lunch |
| 13:00 | Work/Study |
| 14:00 | Deep Work Session |
| 15:00 | Break |
| 16:00 | Work/Study |
| 17:00 | Exercise |
| 18:00 | Dinner |
| 19:00 | Personal Development |
| 20:00 | Relaxation |
| 21:00 | Prepare for Sleep |
| 22:00 | Sleep |

## Performance Colors

- **Green** (80-100%): Excellent performance
- **Yellow** (50-79%): Good but room for improvement
- **Red** (<50%): Needs more attention
- **Gray**: No data recorded

## License

MIT License
