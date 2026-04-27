# CanadaVisaTracker

A full-stack web application that tracks Canadian immigration processing times from IRCC (Immigration, Refugees and Citizenship Canada) and visualizes historical trends.

![Dashboard Screenshot](frontend/screenshot.png)

## The Problem

IRCC publishes current processing times but provides no historical data. Applicants have no way to know if times are improving or getting worse. This app solves that by scraping IRCC daily and building a historical dataset over time.

## Live Demo

> Coming soon — deployment in progress

## Features

- Real-time processing times for 8 visa categories across 190+ countries
- Historical trend charts showing how processing times change over time
- Country and visa type filters
- Color-coded speed indicators (fast / medium / slow)
- Automated daily scraping pipeline
- REST API with 6 endpoints

## Tech Stack

**Backend**
- Python 3.13
- Django 5 + Django REST Framework
- PostgreSQL 18
- python-dotenv for environment management

**Frontend**
- Next.js (React)
- Recharts for data visualization
- Tailwind CSS

**Data Pipeline**
- IRCC public JSON API as data source
- Custom ETL pipeline (fetch → parse → save)
- Celery + Redis for scheduled daily scraping (coming soon)

**DevOps**
- Git + GitHub
- AWS deployment (coming soon)

## Architecture
~~~
IRCC JSON API
↓
scraper/fetch.py      — HTTP request to IRCC endpoint
scraper/parse.py      — normalize inconsistent time formats
scraper/pipeline.py   — orchestrate fetch → parse → save to DB
↓
PostgreSQL Database
↓
Django REST API       — 6 JSON endpoints
↓
Next.js Frontend      — charts, filters, trend visualization
~~~

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/visa-types/` | All 8 visa categories |
| GET | `/api/v1/snapshots/?visa_code=study&country_code=IN` | Processing history |
| GET | `/api/v1/trends/?country_code=IN` | Latest times for all visas |
| GET | `/api/v1/last-updated/` | Most recent scrape timestamp |
| GET | `/api/v1/stats/` | Dataset summary statistics |
| GET | `/api/v1/scrape-logs/` | Scraper run history |

## Local Setup

### Prerequisites
- Python 3.10+
- PostgreSQL
- Node.js 18+

### Backend

```bash
# Clone the repo
git clone https://github.com/Meghapanchal911/canadatvisatracker.git
cd canadatvisatracker

# Create virtual environment
python -m venv venv
venv\Scripts\activate          # Windows
source venv/bin/activate       # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# Set up database
createdb canadavisatracker
python manage.py migrate

# Run the scraper to populate initial data
python -m scraper.pipeline

# Start the server
python manage.py runserver
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:3000`

## Running Tests

```bash
python manage.py test tracker
```

13 tests covering models, API endpoints, input validation and error handling.

## Data Pipeline

The scraper fetches data from IRCC's official JSON endpoint:
https://www.canada.ca/content/dam/ircc/documents/json/data-ptime-en.json

Key engineering decisions:
- Used the underlying JSON API instead of scraping HTML — more reliable and respects the server
- Handles inconsistent time formats: `"37 days"`, `"1 week"`, `"2 months"`
- Handles nested data structures in certain visa categories
- `update_or_create` prevents duplicate records when scraper runs multiple times

## Project Structure
canadavisatracker/
├── config/                 # Django project settings
├── tracker/                # Main Django app
│   ├── models.py           # VisaType, ProcessingSnapshot, ScrapeLog
│   ├── views.py            # API views with input validation
│   ├── serializers.py      # DRF serializers
│   ├── urls.py             # URL routing
│   └── tests.py            # 13 unit + integration tests
├── scraper/                # Data pipeline
│   ├── fetch.py            # HTTP fetching
│   ├── parse.py            # Data normalization
│   └── pipeline.py         # ETL orchestration
├── frontend/               # Next.js app
│   ├── pages/index.js      # Main dashboard
│   └── components/         # MetricCard, TrendChart, ComparisonBar, VisaTable
├── requirements.txt
├── .env.example
└── README.md

## Roadmap

- [ ] Deploy backend to Railway
- [ ] Deploy frontend to Vercel
- [ ] Add AWS Lambda for daily automated scraping
- [ ] Add email alerts for processing time changes
- [ ] Add country comparison feature
- [ ] Add mobile responsive design

## Author

Megha Panchal — Masters in Software Engineering, University of Guelph
[LinkedIn](https://www.linkedin.com/in/megha-panchal-835101206) · 
[GitHub](https://github.com/Meghapanchal911)
