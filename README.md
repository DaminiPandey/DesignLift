# Installation

1. Clone the repository

2. Install PHP and Laravel dependencies

3. Install NPM dependencies

4. Create and setup .env file

```bash
cp .env.example .env
php artisan key:generate
```

5. **Configure your database** in .env and run migrations

```bash
php artisan migrate
```

6. **Start the development server**

```bash
php artisan serve
```

The application will be available at `http://localhost:8000`
