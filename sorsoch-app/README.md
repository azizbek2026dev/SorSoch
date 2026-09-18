# SorSoch.com — BSB va CHSB Portali

Saytingiz endi **haqiqiy loyiha tuzilishida**: HTML, CSS va JavaScript alohida
fayllarda, ma'lumotlar esa brauzer localStorage o'rniga **serverdagi SQLite
database**da saqlanadi. Endi ma'lumotlar barcha foydalanuvchilar uchun bir xil
bo'ladi (avvalgi versiyada har kim faqat o'z brauzerida ko'rar edi).

## 📁 Fayllar tuzilishi

```
sorsoch-app/
├── server.js              # Asosiy server (Express)
├── db.js                  # SQLite bilan ulanish va jadval sxemasi
├── package.json           # Kerakli kutubxonalar ro'yxati
├── .env.example            # Muhit o'zgaruvchilari namunasi
├── middleware/
│   └── auth.js            # Admin ruxsatini tekshirish
├── routes/
│   ├── materials.js       # Materiallar uchun CRUD API
│   └── admin.js           # Login / logout / status API
├── data/
│   └── sorsoch.db          # SQLite baza fayli (avtomatik yaratiladi)
└── public/                 # Frontend (brauzerga yuboriladigan fayllar)
    ├── index.html
    ├── css/
    │   └── style.css
    └── js/
        └── app.js
```

## 🚀 O'rnatish va ishga tushirish

1. [Node.js](https://nodejs.org) (18+ versiya) kompyuteringizda o'rnatilgan bo'lishi kerak.
2. Loyiha papkasida terminalni oching va quyidagini bajaring:

   ```bash
   npm install
   ```

3. `.env.example` faylini nusxalab `.env` nomi bilan saqlang va parolni
   o'zgartiring:

   ```bash
   cp .env.example .env
   ```

   `.env` faylini ochib, `ADMIN_PASSWORD` va `SESSION_SECRET` qiymatlarini
   o'zingizga moslab tahrirlang.

4. Serverni ishga tushiring:

   ```bash
   npm start
   ```

5. Brauzerda oching: **http://localhost:3000**

## 🔑 Admin panel

- "Admin Panel" tugmasini bosing va `.env` faylida ko'rsatgan parolni kiriting.
- Login holati endi **server sessiyasida** saqlanadi (cookie orqali), shuning
  uchun boshqa qurilmadan kirgan odam avtomatik admin bo'lib qolmaydi.
- Parol serverda **hech qachon ochiq matnda saqlanmaydi** — bcrypt bilan
  hash qilinadi.

## 🗄 Database haqida

- Ma'lumotlar `data/sorsoch.db` faylida (SQLite) saqlanadi.
- Har bir material: sarlavha, fan, sinf, turi (BSB/CHSB), chorak, savollar,
  javoblar va ko'rishlar soni bilan birga saqlanadi.
- Backup olish uchun shunchaki `data/sorsoch.db` faylini nusxalashingiz
  kifoya.

## 🌐 Internetga chiqarish (hosting)

Saytni internetga qo'yish uchun Node.js'ni qo'llab-quvvatlaydigan xizmatlar:
**Render.com**, **Railway.app**, **Fly.io** yoki o'z VPS serveringiz (masalan,
Ubuntu + PM2 + Nginx). Statik hostinglar (GitHub Pages kabi) ishlamaydi, chunki
saytda haqiqiy backend server va database bor.

Hostingga joylashtirishda:
1. `.env` faylidagi parol va sessiya kalitini albatta o'zgartiring.
2. `data/` papkasi doimiy saqlanadigan diskda (persistent disk/volume) bo'lishi kerak — aks holda server qayta ishga tushganda ma'lumotlar o'chib ketishi mumkin.

## 🔧 API yo'nalishlari (o'zingiz kengaytirmoqchi bo'lsangiz)

| Metod  | Yo'l                     | Tavsif                          |
|--------|--------------------------|----------------------------------|
| GET    | `/api/materials`         | Ro'yxat (filtr: search, grade, type, term) |
| GET    | `/api/materials/:id`     | Bitta material (views +1)       |
| POST   | `/api/materials`         | Yangi qo'shish (admin)          |
| PUT    | `/api/materials/:id`     | Tahrirlash (admin)               |
| DELETE | `/api/materials/:id`     | O'chirish (admin)                |
| POST   | `/api/admin/login`       | Kirish                           |
| POST   | `/api/admin/logout`      | Chiqish                          |
| GET    | `/api/admin/status`      | Joriy holat                      |
