#!/bin/bash
# ============================================
# ChubbyGenius AI - Setup Otomatis
# Jalankan: bash setup.sh
# ============================================

set -e

echo ""
echo "╔════════════════════════════════════╗"
echo "║   🧠 ChubbyGenius AI Setup         ║"
echo "║   Tunggu 3-5 menit ya...           ║"
echo "╚════════════════════════════════════╝"
echo ""

# ─── Install PHP & tools ───────────────────
echo "📦 [1/7] Install PHP..."
sudo apt-get update -qq 2>/dev/null
sudo apt-get install -y -qq \
    php8.3 php8.3-cli php8.3-mysql php8.3-sqlite3 \
    php8.3-mbstring php8.3-xml php8.3-curl \
    php8.3-zip php8.3-gd php8.3-bcmath \
    unzip curl 2>/dev/null
echo "   ✅ PHP siap"

# ─── Install Composer ──────────────────────
echo "📦 [2/7] Install Composer..."
curl -sS https://getcomposer.org/installer | php -- --quiet
sudo mv composer.phar /usr/local/bin/composer
echo "   ✅ Composer siap"

# ─── Buat project Laravel ──────────────────
echo "📦 [3/7] Buat project Laravel (ini paling lama)..."
composer create-project laravel/laravel . --prefer-dist --quiet
echo "   ✅ Laravel siap"

# ─── Install packages tambahan ─────────────
echo "📦 [4/7] Install Inertia & Breeze..."
composer require inertiajs/inertia-laravel --quiet
composer require laravel/breeze --quiet
php artisan breeze:install react --no-interaction --quiet
echo "   ✅ Breeze + React siap"

# ─── Install Node packages ─────────────────
echo "📦 [5/7] Install Node packages..."
npm install --silent
npm install framer-motion axios --silent --legacy-peer-deps
echo "   ✅ Node packages siap"

# ─── Setup environment ─────────────────────
echo "⚙️  [6/7] Setup environment..."
cp .env.example .env
php artisan key:generate --quiet

# Pakai SQLite untuk development (tidak perlu MySQL dulu)
touch database/database.sqlite
sed -i 's/DB_CONNECTION=mysql/DB_CONNECTION=sqlite/' .env
sed -i '/DB_HOST=/d' .env
sed -i '/DB_PORT=/d' .env
sed -i '/DB_DATABASE=/d' .env
sed -i '/DB_USERNAME=/d' .env
sed -i '/DB_PASSWORD=/d' .env

PROJECT_DIR=$(pwd)
echo "DB_DATABASE=${PROJECT_DIR}/database/database.sqlite" >> .env

# Tambah config AI (isi nanti)
echo "" >> .env
echo "# === AI SETTINGS ===" >> .env
echo "AI_PROVIDER=gemini" >> .env
echo "GEMINI_API_KEY=ISI_API_KEY_DISINI" >> .env
echo "OPENAI_API_KEY=" >> .env
echo "" >> .env
echo "# === QUIZ SETTINGS ===" >> .env
echo "QUIZ_QUESTIONS_PER_SESSION=10" >> .env
echo "QUIZ_TIME_PER_QUESTION=30" >> .env
echo "QUIZ_STREAK_THRESHOLD=3" >> .env

echo "   ✅ Environment siap"

# ─── Buat direktori yang dibutuhkan ────────
echo "📁 [7/7] Siapkan direktori..."
mkdir -p app/Services
mkdir -p app/Models
echo "   ✅ Direktori siap"

echo ""
echo "╔════════════════════════════════════════════════╗"
echo "║   ✅ SETUP DASAR SELESAI!                       ║"
echo "║                                                ║"
echo "║   LANGKAH SELANJUTNYA:                         ║"
echo "║   1. Copy semua file kode dari panduan         ║"
echo "║   2. Jalankan: bash finish.sh                  ║"
echo "╚════════════════════════════════════════════════╝"
echo ""
