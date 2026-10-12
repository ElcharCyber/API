# OpenJob RESTful API Versi 2

Proyek ini adalah implementasi OpenJob RESTful API Versi 2 untuk kriteria submission Dicoding Back-End Expert, yang mencakup fitur:
1. **Document Upload & Storage (PDF Only, Multer)**: Mendukung upload berkas resume/CV format PDF (maksimal 5 MB), metadata disimpan di database tabel `documents`, serta endpoint untuk melihat/mengunduh berkas PDF.
2. **Caching (Redis)**: Menerapkan caching Redis pada endpoint detail dan list resource dengan durasi cache 1 jam (3600 detik), pengembalian header `X-Data-Source: cache` (jika hit) dan `X-Data-Source: database` (jika miss), serta cache invalidation otomatis saat terjadi perubahan data terkait.
3. **Message Broker (RabbitMQ) & Email Notifications (Nodemailer)**: Memublikasikan pesan secara asynchronous ke RabbitMQ saat pelamar membuat lamaran pekerjaan, dan program consumer yang memproses pesan secara asinkron untuk mengirimkan email notifikasi ke pemilik lowongan pekerjaan (job owner) menggunakan Nodemailer.

---

## 🛠️ Persyaratan Sistem

- **Node.js** (v18+)
- **PostgreSQL** (Port 5432)
- **Redis** (Port 6379)
- **RabbitMQ** (Port 5672)

---

## ⚙️ Konfigurasi Environment Variables (`.env`)

Salin berkas `.env.example` ke `.env`:

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

# Nodemailer / SMTP Configuration
MAIL_HOST=sandbox.smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USER=your_mail_username
MAIL_PASSWORD=your_mail_password
```

---

## 🚀 Menjalankan Aplikasi

### 1. Instalasi Dependensi
```bash
npm install
```

### 2. Menjalankan Migrasi Database
```bash
npm run migrate:up
```

### 3. Menjalankan Server API
```bash
npm run start
```
Atau untuk mode development:
```bash
npm run start:dev
```

### 4. Menjalankan Consumer RabbitMQ
Di terminal terpisah, jalankan:
```bash
npm run start:consumer
```

---

## 🧪 Pengujian Postman

1. Buka aplikasi Postman.
2. Import berkas `[271] OpenJob API Test V2.postman_collection.json` dan `OpenJob API.postman_environment.json`.
3. Pilih environment `OpenJob API`.
4. Untuk pengujian menggunakan Collection Runner:
   - Sesuai panduan Dicoding, kecualikan/uncheck folder `[Mandatory] Documents` pada Collection Runner (karena pengujian berkas pada Postman Runner membutuhkan file attachment manual).
   - Jalankan seluruh koleksi request lainnya secara berurutan.
5. Untuk pengujian folder `[Mandatory] Documents`:
   - Jalankan request secara manual per request dengan melampirkan berkas PDF di request `Upload Document with Valid PDF`.
