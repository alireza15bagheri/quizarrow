🚀 QuizArrow: A Real-Time Quiz Application

QuizArrow is a full-stack, real-time quiz platform designed for creating, sharing, and participating in interactive quizzes. It features a modern, responsive frontend built with React and a powerful RESTful API backend powered by Django. The entire application is containerized with Docker for easy deployment and scalability.

✨ Key Features

    User Authentication: Secure user registration and login system.

    Quiz Management: Authenticated users can create, edit, and publish their own quizzes with multiple-choice questions.

    Real-Time Gameplay: Join a quiz lobby and participate in a live quiz session with other users.

    Scoring & Results: View detailed results and history of quiz participations.

    Tagging System: Organize and discover quizzes with a flexible tagging system (e.g., 'Science', 'History', 'Easy Difficulty').

    Admin Dashboard: A dedicated admin page for managing quizzes and users.

🛠️ Tech Stack

The project is built with a modern technology stack, separating the frontend and backend for a clean architecture.
Frontend	Backend	Deployment
React	Django	Docker
Vite	Django REST Framework	Nginx
Tailwind CSS	PostgreSQL	Gunicorn
Axios	-	-

🏁 Getting Started: Local Development Setup

Follow these instructions to get a local copy of the project up and running for development.

Prerequisites

    Git

    Python 3.10+

    Node.js and npm

    PostgreSQL running locally

1. Clone the Repository

Bash

git clone https://github.com/your-username/quizarrow.git
cd quizarrow

2. Backend Setup ⚙️

    Navigate to the backend directory:
    Bash

cd backend

Create and activate a virtual environment:
Bash

# Create the environment
python -m venv venv

# Activate it (macOS/Linux)
source venv/bin/activate

# Activate it (Windows)
.\venv\Scripts\activate

Install dependencies:
Bash

pip install -r requirements.txt

Set up the environment file: Copy the sample .env file and fill in your local database credentials.
Bash

cp .env-sample .env

Edit the .env file with your PostgreSQL settings (DB_NAME, DB_USER, DB_PASSWORD).

Run database migrations and seed initial data:
Bash

python manage.py migrate

Create a superuser to access the admin panel:
Bash

python manage.py createsuperuser

Run the backend server:
Bash

    python manage.py runserver

    The backend API will be running at http://127.0.0.1:8000.

3. Frontend Setup ⚛️

    Open a new terminal window.

    Navigate to the frontend directory:
    Bash

cd frontend

Install npm dependencies:
Bash

npm install

Run the frontend development server:
Bash

    npm run dev

    The frontend application will be available at http://localhost:5173. It is pre-configured to connect to your local backend API.

🐳 Docker Deployment

For a production-like environment, you can build and run the entire application using Docker Compose.

Prerequisites

    Docker

    Docker Compose

Running the Application

    Set up production environment variables:
    Bash

cp .env.prod-sample .env.prod

Make sure to set a strong SECRET_KEY and database credentials in the .env.prod file.

Build and run the containers: The provided shell script handles everything.
Bash

    chmod +x prod-up.sh
    ./prod-up.sh

    This script will build the Docker images, run the containers, apply database migrations, and create a superuser for you.

    Access the application: Once the script finishes, the application will be accessible at http://localhost.

🤝 Contributing

Contributions are welcome! If you have suggestions for improving the project, please feel free to open an issue or submit a pull request.

    Fork the Project

    Create your Feature Branch (git checkout -b feature/AmazingFeature)

    Commit your Changes (git commit -m 'Add some AmazingFeature')

    Push to the Branch (git push origin feature/AmazingFeature)

    Open a Pull Request
