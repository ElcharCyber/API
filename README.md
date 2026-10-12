# OpenJob RESTful API & Consumer Versi 2

Proyek ini adalah implementasi **OpenJob RESTful API Versi 2** untuk kriteria submission Dicoding Back-End Expert / Belajar Fundamental Back-End dengan JavaScript. Proyek ini terdiri dari dua aplikasi terpisah yang berdiri sendiri (*independent projects*) dan berkomunikasi secara asinkron menggunakan RabbitMQ:

1. **`openjob_api`**: RESTful API server yang mengelola pengguna, otentikasi (JWT), perusahaan, kategori, lowongan kerja (*jobs*), lamaran (*applications*), bookmark, dokumen PDF (Multer), dan caching (Redis). Saat lamaran baru dibuat, API akan mempublikasikan pesan ke RabbitMQ secara asinkron (non-blocking).
2. **`openjob_consumer`**: Consumer terpisah yang mendengarkan antrean RabbitMQ (`applications:queue`), mengambil detail lamaran & pemilik lowongan dari PostgreSQL, dan mengirimkan notifikasi email ke pemilik lowongan kerja menggunakan Nodemailer (SMTP / Mailtrap).

---

## 📁 Struktur Proyek (Project Structure)

Sesuai dengan kriteria submission Dicoding:
```text
.
├── openjob_api/
│   ├── migrations/                      # Berkas migrasi database PostgreSQL (node-pg-migrate)
│   ├── src/
│   │   ├── api/                         # Plugin & handler route Express
│   │   ├── exceptions/                  # Custom error exceptions
│   │   ├── middlewares/                 # Authentication & error handling middleware
│   │   ├── services/
│   │   │   ├── postgres/                # PostgreSQL services (Users, Jobs, Applications, dll.)
│   │   │   ├── rabbitmq/                # RabbitMQ ProducerService (pengirim antrean)
│   │   │   └── redis/                   # Redis CacheService
│   │   ├── tokenize/                    # JWT Token Manager
│   │   ├── validator/                   # Joi schema validation
│   │   ├── app.js                       # Express app bootstrap
│   │   └── server.js                    # Entry point API server
│   ├── uploads/                         # Direktori penyimpanan berkas PDF resume
│   ├── .env.example
│   └── package.json                     # Konfigurasi & dependensi API
│
├── openjob_consumer/
│   ├── src/
│   │   ├── ApplicationsService.js       # Database service pengambil detail lamaran
│   │   ├── MailSender.js                # Layanan pengiriman email Nodemailer
│   │   ├── Listener.js                  # Handler pemroses pesan dari antrean
│   │   └── consumer.js                  # Entry point consumer RabbitMQ
│   ├── .env.example
│   └── package.json                     # Konfigurasi & dependensi Consumer
│
├── [271] OpenJob API Test V2.postman_collection.json
├── OpenJob API.postman_environment.json
└── README.md
```

---

## 🛠️ Persyaratan Sistem

- **Node.js** (v18 atau lebih baru)
- **PostgreSQL** (Port default: `5432`)
- **Redis** (Port default: `6379`)
- **RabbitMQ** (Port default: `5672`)
- **Mailtrap / SMTP Server** (untuk pengujian email notifikasi)

---

## ⚙️ Konfigurasi Environment (`.env`)

### 1. Konfigurasi `openjob_api`
Buat berkas `.env` di dalam folder `openjob_api` (salin dari `openjob_api/.env.example`):
```env
# Server Configuration
HOST=localhost
PORT=3000

# PostgreSQL Database Configuration
PGUSER=postgres
PGPASSWORD=postgres
PGDATABASE=openjob
PGHOST=localhost
PGPORT=5432

# JWT Token Configuration
ACCESS_TOKEN_KEY=openjob_access_token_secret_key_2026_super_secure
REFRESH_TOKEN_KEY=openjob_refresh_token_secret_key_2026_super_secure
ACCESS_TOKEN_AGE=10800

# Redis Cache Configuration
REDIS_HOST=localhost
REDIS_PORT=6379

# RabbitMQ Configuration
RABBITMQ_HOST=localhost
RABBITMQ_PORT=5672
RABBITMQ_USER=guest
RABBITMQ_PASSWORD=guest
AMQP_URL=amqp://guest:guest@localhost:5672
```

### 2. Konfigurasi `openjob_consumer`
Buat berkas `.env` di dalam folder `openjob_consumer` (salin dari `openjob_consumer/.env.example`):
```env
# PostgreSQL Database Configuration
PGUSER=postgres
PGPASSWORD=postgres
PGDATABASE=openjob
PGHOST=localhost
PGPORT=5432

# RabbitMQ Configuration
RABBITMQ_HOST=localhost
RABBITMQ_PORT=5672
RABBITMQ_USER=guest
RABBITMQ_PASSWORD=guest
AMQP_URL=amqp://guest:guest@localhost:5672

# Nodemailer / SMTP Configuration (e.g. Mailtrap)
MAIL_HOST=sandbox.smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USER=your_mailtrap_username
MAIL_PASSWORD=your_mailtrap_password
MAIL_FROM=no-reply@openjob.com
```

---

## 🚀 Panduan Menjalankan Aplikasi

### Langkah 1: Setup dan Jalankan `openjob_api`
Buka terminal dan arahkan ke direktori `openjob_api`:
```bash
cd openjob_api

# 1. Install dependensi
npm install

# 2. Jalankan migrasi database
npm run migrate:up

# 3. Jalankan server API
npm run start
# Atau mode development (auto-reload):
npm run start:dev
```
Server API akan berjalan pada `http://localhost:3000`.

---

### Langkah 2: Setup dan Jalankan `openjob_consumer`
Buka **terminal baru** (terpisah) dan arahkan ke direktori `openjob_consumer`:
```bash
cd openjob_consumer

# 1. Install dependensi
npm install

# 2. Jalankan consumer
npm run start
# Atau mode development:
npm run start:dev
```
Consumer akan menampilkan log:
```text
Consumer berjalan dan mendengarkan antrean: applications:queue
```

---

## 🧪 Pengujian Postman

1. Buka aplikasi **Postman**.
2. Import berkas `[271] OpenJob API Test V2.postman_collection.json` dan `OpenJob API.postman_environment.json`.
3. Pilih environment **OpenJob API**.
4. **Collection Runner**:
   - Uncheck folder `[Mandatory] Documents` jika menjalankan melalui Postman Runner (karena pengujian berkas PDF memerlukan attachment manual).
   - Jalankan collection runner untuk seluruh folder mandatory dan opsional.
5. **Uji Dokumen**:
   - Jalankan request di dalam folder `[Mandatory] Documents` dengan melampirkan berkas PDF pada request `Upload Document with Valid PDF`.
6. **Uji RabbitMQ**:
   - Saat request `Apply for Job - Triggers RabbitMQ Publish` dijalankan pada folder `[RabbitMQ] Feature Test`, API akan mempublikasikan pesan secara non-blocking.
   - Program `openjob_consumer` yang berjalan akan menangkap pesan tersebut, mengambil data relasi pelamar & lowongan pekerjaan dari database, dan mengirimkan email notifikasi ke akun pemilik lowongan (bisa dipantau di dashboard Mailtrap).
