import json
import os
import shutil

# Yollar
IMPORT_JSON = r"C:\Users\ulaso\source\repos\bitirme_projesi\bitirme_projesi\products_import.json"
BACKUP_JSON = IMPORT_JSON + ".backup_new_categories"
BACKEND_WWWROOT = r"C:\Users\ulaso\source\repos\bitirme_projesi\bitirme_projesi\wwwroot\images"

# Silinecek kategoriler
REMOVE_CATEGORIES = [8, 9, 10]  # Mücevher, Gözlük, Parfüm
CATEGORY_NAMES = {
    8: "mücevher",
    9: "gözlük",
    10: "parfüm"
}

print("🔄 Yeni kategoriler geri alınıyor...\n")

# 1. Import JSON'dan yeni kategorileri kaldır
print("📝 Import JSON temizleniyor...")

# Yedek oluştur
if os.path.exists(IMPORT_JSON):
    shutil.copy2(IMPORT_JSON, BACKUP_JSON)
    print(f"   ✅ Yedek oluşturuldu: {BACKUP_JSON}")

# JSON'u oku
with open(IMPORT_JSON, 'r', encoding='utf-8') as f:
    all_products = json.load(f)

print(f"   Mevcut ürün sayısı: {len(all_products)}")

# Yeni kategorileri filtrele
filtered_products = [p for p in all_products if p.get('categoryId') not in REMOVE_CATEGORIES]

print(f"   Kaldırılan ürün sayısı: {len(all_products) - len(filtered_products)}")
print(f"   Kalan ürün sayısı: {len(filtered_products)}")

# JSON'u kaydet
with open(IMPORT_JSON, 'w', encoding='utf-8') as f:
    json.dump(filtered_products, f, ensure_ascii=False, indent=2)

print(f"   ✅ Import JSON güncellendi\n")

# 2. Resim klasörlerini sil
print("🗑️  Resim klasörleri siliniyor...")
for cat_id, cat_name in CATEGORY_NAMES.items():
    folder_path = os.path.join(BACKEND_WWWROOT, cat_name)
    if os.path.exists(folder_path):
        try:
            shutil.rmtree(folder_path)
            print(f"   ✅ {cat_name} klasörü silindi")
        except Exception as e:
            print(f"   ⚠️  {cat_name} klasörü silinemedi: {e}")
    else:
        print(f"   ℹ️  {cat_name} klasörü bulunamadı (zaten silinmiş)")

print("\n" + "="*60)
print("✅ İşlem tamamlandı!")
print("="*60)
print(f"\n📦 Kalan ürün sayısı: {len(filtered_products)}")
print(f"📄 Import JSON: {IMPORT_JSON}")
print(f"💾 Yedek: {BACKUP_JSON}")
print("\n💡 Backend'den yeni kategori ürünlerini silmek için:")
print("   Swagger'dan DELETE endpoint'lerini kullan:")
for cat_id, cat_name in CATEGORY_NAMES.items():
    print(f"   - DELETE /api/Product/by-category/{cat_id} (Eğer kategori ID {cat_id} varsa)")
print("\n⚠️  Not: Backend'de kategorileri manuel olarak silmen gerekebilir")
print("   (Swagger'dan DELETE /api/Category/{id} veya veritabanından)")
print("\n")




