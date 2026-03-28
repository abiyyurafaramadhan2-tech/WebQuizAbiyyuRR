#!/bin/bash
# ============================================
# ChubbyGenius AI - Setup Robust
# Tidak akan berhenti meski ada error kecil
# ============================================

# TIDAK pakai set -e supaya tidak berhenti saat error

echo ""
echo "╔══════════════════════════════════════╗"
echo "║   🧠 ChubbyGenius AI Setup           ║"
echo "║   Versi Robust - Tahan Error         ║"
echo "╚══════════════════════════════════════╝"
echo ""

# ─── Fungsi helper ─────────────────────────
ok()   { echo "   ✅ $1"; }
warn() { echo "   ⚠️  $1"; }
info() { echo "   ℹ️  $1"; }

# ─── STEP 1: Cek & Install PHP ─────────────
echo "📦 [1/8] Cek PHP..."

if php --version > /dev/null 2>&1; then
    PHP_VER=$(php --version | head -1)
    ok "PHP sudah ada: $PHP_VER"
else
    info "PHP belum ada, install sekarang..."
    sudo apt-get update -y > /dev/null 2>&1 || warn "apt update gagal, lanjut..."
    
    # Coba install PHP 8.3 dulu
    sudo apt-get install -y php8.3-cli php8.3-mysql php8.3-sqlite3 \
        php8.3-mbstring php8.3-xml php8.3-curl php8.3-zip \
        php8.3-gd php8.3-bcmath > /dev/null 2>&1
    
    # Jika PHP 8.3 gagal, coba PHP 8.2
    if ! php --version > /dev/null 2>&1; then
        warn "PHP 8.3 gagal, coba PHP 8.2..."
        sudo apt-get install -y php8.2-cli php8.2-mysql php8.2-sqlite3 \
            php8.2-mbstring php8.2-xml php8.2-curl php8.2-zip \
            php8.2-gd php8.2-bcmath > /dev/null 2>&1
    fi
    
    # Jika masih gagal, coba tanpa versi spesifik
    if ! php --version > /dev/null 2>&1; then
        warn "Coba install PHP generic..."
        sudo apt-get install -y php-cli php-mysql php-sqlite3 \
            php-mbstring php-xml php-curl php-zip \
            php-gd php-bcmath > /dev/null 2>&1
    fi
    
    if php --version > /dev/null 2>&1; then
        ok "PHP berhasil diinstall: $(php --version | head -1)"
    else
        echo ""
        echo "❌ PHP gagal diinstall."
        echo "   Coba jalankan manual: sudo apt-get install -y php-cli"
        echo "   Lalu jalankan setup.sh lagi."
        exit 1
    fi
fi

# ─── STEP 2: Install Composer ──────────────
echo "📦 [2/8] Cek Composer..."

if composer --version > /dev/null 2>&1; then
    ok "Composer sudah ada: $(composer --version | head -1)"
else
    info "Install Composer..."
    
    # Download composer
    curl -sS https://getcomposer.org/installer -o /tmp/composer-setup.php
    
    if [ $? -eq 0 ]; then
        php /tmp/composer-setup.php --install-dir=/tmp --filename=composer > /dev/null 2>&1
        sudo mv /tmp/composer /usr/local/bin/composer
        sudo chmod +x /usr/local/bin/composer
        
        if composer --version > /dev/null 2>&1; then
            ok "Composer berhasil diinstall"
        else
            echo "❌ Composer gagal. Coba: curl -sS https://getcomposer.org/installer | php"
            exit 1
        fi
    else
        echo "❌ Gagal download Composer. Cek koneksi internet."
        exit 1
    fi
fi

# ─── STEP 3: Cek Node.js ───────────────────
echo "📦 [3/8] Cek Node.js..."

if node --version > /dev/null 2>&1; then
    ok "Node.js sudah ada: $(node --version)"
else
    info "Install Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - > /dev/null 2>&1
    sudo apt-get install -y nodejs > /dev/null 2>&1
    
    if node --version > /dev/null 2>&1; then
        ok "Node.js berhasil diinstall: $(node --version)"
    else
        echo "❌ Node.js gagal. Coba: sudo apt-get install -y nodejs"
        exit 1
    fi
fi

# ─── STEP 4: Buat project Laravel ──────────
echo "📦 [4/8] Buat project Laravel..."
echo "   (ini yang paling lama, 2-4 menit, harap tunggu!)"
echo ""

# Cek apakah sudah ada Laravel (cek artisan)
if [ -f "artisan" ]; then
    ok "Laravel sudah ada, skip..."
else
    info "Download Laravel..."
    
    # Jalankan dengan output supaya kelihatan prosesnya
    composer create-project laravel/laravel . --prefer-dist --no-interaction
    
    if [ $? -eq 0 ]; then
        ok "Laravel berhasil dibuat"
    else
        echo ""
        echo "❌ Laravel gagal dibuat."
        echo "   Kemungkinan masalah:"
        echo "   1. Koneksi internet lambat"
        echo "   2. Memory tidak cukup"
        echo "   Coba jalankan lagi: bash setup.sh"
        exit 1
    fi
fi

# ─── STEP 5: Install Breeze + Inertia ──────
echo "📦 [5/8] Install Breeze + Inertia..."

# Cek apakah sudah terinstall
if [ -d "vendor/laravel/breeze" ]; then
    ok "Breeze sudah ada, skip..."
else
    info "Install packages..."
    
    composer require inertiajs/inertia-laravel --no-interaction
    composer require laravel/breeze --no-interaction
    
    info "Setup Breeze dengan React..."
    php artisan breeze:install react --no-interaction
    
    ok "Breeze + React siap"
fi

# ─── STEP 6: Install Node packages ─────────
echo "📦 [6/8] Install Node packages..."

if [ -d "node_modules" ]; then
    ok "Node modules sudah ada, skip..."
else
    npm install
    ok "Node modules siap"
fi

# Install framer-motion
npm list framer-motion > /dev/null 2>&1
if [ $? -ne 0 ]; then
    info "Install framer-motion..."
    npm install framer-motion --legacy-peer-deps
fi

ok "Semua Node packages siap"

# ─── STEP 7: Setup .env ────────────────────
echo "⚙️  [7/8] Setup environment..."

if [ ! -f ".env" ]; then
    cp .env.example .env
fi

# Generate key jika belum ada
APP_KEY=$(grep "^APP_KEY=" .env | cut -d'=' -f2)
if [ -z "$APP_KEY" ] || [ "$APP_KEY" = "" ]; then
    php artisan key:generate
    ok "App key dibuat"
else
    ok "App key sudah ada"
fi

# Setup SQLite (tidak perlu MySQL untuk development)
touch database/database.sqlite

# Update .env untuk SQLite
CURRENT_DIR=$(pwd)

# Ganti konfigurasi database
python3 - << 'PYEOF'
import re, os

env_path = '.env'
with open(env_path, 'r') as f:
    content = f.read()

# Ganti DB settings ke SQLite
content = re.sub(r'DB_CONNECTION=.*', 'DB_CONNECTION=sqlite', content)
content = re.sub(r'DB_HOST=.*\n', '', content)
content = re.sub(r'DB_PORT=.*\n', '', content)
content = re.sub(r'DB_DATABASE=.*\n', '', content)
content = re.sub(r'DB_USERNAME=.*\n', '', content)
content = re.sub(r'DB_PASSWORD=.*\n', '', content)

with open(env_path, 'w') as f:
    f.write(content)

print("   DB config diupdate")
PYEOF

# Tambahkan DB_DATABASE untuk SQLite
echo "DB_DATABASE=${CURRENT_DIR}/database/database.sqlite" >> .env

# Tambahkan AI settings
if ! grep -q "AI_PROVIDER" .env; then
    cat >> .env << 'ENVEOF'

# === AI SETTINGS ===
AI_PROVIDER=gemini
GEMINI_API_KEY=ISI_API_KEY_DISINI
OPENAI_API_KEY=

# === QUIZ SETTINGS ===
QUIZ_QUESTIONS_PER_SESSION=10
QUIZ_TIME_PER_QUESTION=30
QUIZ_STREAK_THRESHOLD=3
ENVEOF
    ok "AI settings ditambahkan ke .env"
else
    ok ".env sudah punya AI settings"
fi

ok "Environment siap"

# ─── STEP 8: Buat folder yang dibutuhkan ───
echo "📁 [8/8] Siapkan struktur folder..."

mkdir -p app/Services
mkdir -p app/Models
mkdir -p app/Http/Controllers

ok "Folder siap"

# ─── SELESAI ───────────────────────────────
echo ""
echo "╔══════════════════════════════════════════════════╗"
echo "║                                                  ║"
echo "║   ✅ SETUP DASAR SELESAI!                         ║"
echo "║                                                  ║"
echo "║   LANGKAH SELANJUTNYA:                           ║"
echo "║   1. Copy semua file kode dari panduan           ║"
echo "║      (lihat daftar file di instruksi)            ║"
echo "║                                                  ║"
echo "║   2. Setelah semua file dicopy, ketik:           ║"
echo "║      bash finish.sh                              ║"
echo "║                                                  ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""
echo "📋 Ringkasan yang sudah terinstall:"
echo "   PHP     : $(php --version | head -1 | cut -d' ' -f1-2)"
echo "   Composer: $(composer --version | head -1)"
echo "   Node    : $(node --version)"
echo "   Laravel : $(php artisan --version 2>/dev/null || echo 'Siap')"
echo ""
