# OpenJob RESTful API

Komponen RESTful API dari OpenJob Versi 2.

## Menjalankan Proyek:
1. Pastikan PostgreSQL, Redis, dan RabbitMQ aktif.
2. Salin `.env.example` ke `.env` dan sesuaikan konfigurasinya.
3. Jalankan `npm install`.
4. Jalankan migrasi database: `npm run migrate:up`.
5. Jalankan server: `npm run start` atau `npm run start:dev`.
