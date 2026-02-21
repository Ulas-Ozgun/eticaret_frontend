import json
import re

json_path = r"C:\Users\ulaso\source\repos\bitirme_projesi\bitirme_projesi\products_import.json"
backup_path = json_path + ".backup"

print("🧹 JSON temizleniyor...")

# Yedek oluştur
import shutil
shutil.copy2(json_path, backup_path)
print(f"✅ Yedek oluşturuldu: {backup_path}")

# JSON'u oku
with open(json_path, 'r', encoding='utf-8') as f:
    products = json.load(f)

print(f"📊 Toplam {len(products)} ürün bulundu")

# Her ürünü temizle
cleaned_count = 0
for i, product in enumerate(products):
    # Name'i string'e çevir ve temizle
    original_name = str(product.get('name', ''))
    original_desc = str(product.get('description', ''))
    
    # Name'i temizle
    if 'name' in product:
        name_value = product['name']
        # Her türlü değeri string'e çevir
        if not isinstance(name_value, str):
            name_value = str(name_value)
        # Özel karakterleri temizle
        name_value = re.sub(r'[\n\r\t]', ' ', name_value)
        name_value = re.sub(r'\s+', ' ', name_value).strip()
        # Tırnak işaretlerini düzelt
        name_value = name_value.replace('"', "'")
        # JSON escape karakterlerini temizle
        name_value = name_value.replace('\\', '')
        product['name'] = name_value
    
    # Description'ı temizle
    if 'description' in product:
        desc_value = product['description']
        if not isinstance(desc_value, str):
            desc_value = str(desc_value)
        desc_value = re.sub(r'[\n\r\t]', ' ', desc_value)
        desc_value = re.sub(r'\s+', ' ', desc_value).strip()
        desc_value = desc_value.replace('"', "'")
        desc_value = desc_value.replace('\\', '')
        product['description'] = desc_value
    
    # Değişiklik varsa say
    if product.get('name', '') != original_name or product.get('description', '') != original_desc:
        cleaned_count += 1
        if i == 2382:  # Hata veren satır
            print(f"   Satır 2382 düzeltildi:")
            old_name = original_name[:50] if len(original_name) > 50 else original_name
            new_name = product.get('name', '')[:50] if len(product.get('name', '')) > 50 else product.get('name', '')
            print(f"      Eski name: {old_name}...")
            print(f"      Yeni name: {new_name}...")

# Temizlenmiş JSON'u kaydet
with open(json_path, 'w', encoding='utf-8') as f:
    json.dump(products, f, ensure_ascii=False, indent=2)

print(f"✅ {cleaned_count} ürün temizlendi")
print(f"✅ JSON dosyası kaydedildi")

# Validate et
try:
    with open(json_path, 'r', encoding='utf-8') as f:
        test_data = json.load(f)
    print(f"✅ JSON doğrulandı: {len(test_data)} ürün")
    
    # 2382. ürünü kontrol et
    if len(test_data) > 2382:
        print(f"\n📋 2382. ürün kontrolü:")
        print(f"   Name: {test_data[2382].get('name', '')[:100]}")
        print(f"   Description: {test_data[2382].get('description', '')[:100]}")
        
except Exception as e:
    print(f"❌ JSON doğrulama hatası: {e}")

