#!/bin/bash
# ============================================
# Jalankan SETELAH semua file kode dicopy
# Perintah: bash finish.sh
# ============================================

set -e

echo ""
echo "╔════════════════════════════════════╗"
echo "║   🧠 ChubbyGenius - Finishing Up   ║"
echo "╚════════════════════════════════════╝"
echo ""

# ─── Migrate database ──────────────────────
echo "🗄️  Membuat tabel database..."
php artisan migrate --force
echo "   ✅ Database siap"

# ─── Build frontend ────────────────────────
echo "🎨 Build tampilan (±1 menit)..."
npm run build
echo "   ✅ Frontend siap"

# ─── Clear cache ───────────────────────────
echo "🧹 Bersihkan cache..."
php artisan config:clear
php artisan route:clear
php artisan view:clear
echo "   ✅ Cache bersih"

echo ""
echo "╔════════════════════════════════════════════════╗"
echo "║   🚀 APLIKASI SIAP!                             ║"
echo "║                                                ║"
echo "║   Buka browser & klik port 8000                ║"
echo "║   (lihat tab PORTS di Codespaces)              ║"
echo "╚════════════════════════════════════════════════╝"
echo ""

# Jalankan server
php artisan serve --host=0.0.0.0 --port=8000
