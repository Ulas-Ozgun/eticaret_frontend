import json

json_path = r"C:\Users\ulaso\source\repos\bitirme_projesi\bitirme_projesi\products_import.json"

print("🔍 NaN değerleri kontrol ediliyor...")

with open(json_path, 'r', encoding='utf-8') as f:
    products = json.load(f)

print(f"📊 Toplam {len(products)} ürün")

# NaN, null, boş name'leri düzelt
fixed_count = 0
removed_count = 0
valid_products = []

for i, product in enumerate(products):
    name = product.get('name', '')
    description = product.get('description', '')
    
    # Name kontrolü
    if not name or name == 'nan' or name == 'None' or str(name).lower() == 'nan':
        # Name yoksa description'dan veya filename'den oluştur
        if description and description != 'nan':
            product['name'] = description.split(' - ')[0] if ' - ' in description else description[:50]
        elif product.get('filename'):
            product['name'] = f"Ürün {product['filename'].replace('.jpg', '')}"
        else:
            product['name'] = f"Ürün {i+1}"
        
        fixed_count += 1
        if i == 2382:
            print(f"   Satır 2382 düzeltildi:")
            print(f"      Yeni name: {product['name']}")
    
    # Description kontrolü
    if not description or description == 'nan' or description == 'None' or str(description).lower() == 'nan':
        product['description'] = product.get('name', 'Ürün Açıklaması')
        fixed_count += 1
    
    # Geçerli ürünleri ekle
    if product.get('name') and product.get('name') != 'nan':
        valid_products.append(product)
    else:
        removed_count += 1

print(f"✅ {fixed_count} ürün düzeltildi")
print(f"❌ {removed_count} geçersiz ürün kaldırıldı")
print(f"📦 {len(valid_products)} geçerli ürün kaldı")

# Düzeltilmiş JSON'u kaydet
with open(json_path, 'w', encoding='utf-8') as f:
    json.dump(valid_products, f, ensure_ascii=False, indent=2)

print(f"✅ JSON dosyası güncellendi")

# Validate et
try:
    with open(json_path, 'r', encoding='utf-8') as f:
        test_data = json.load(f)
    print(f"✅ JSON doğrulandı: {len(test_data)} ürün")
    
    # 2382. ürünü kontrol et (eğer hala varsa)
    if len(test_data) > 2382:
        print(f"\n📋 2382. ürün:")
        print(f"   Name: {test_data[2382].get('name', '')[:100]}")
        print(f"   Description: {test_data[2382].get('description', '')[:100]}")
    else:
        print(f"\n📋 Son ürün:")
        print(f"   Name: {test_data[-1].get('name', '')[:100]}")
        
except Exception as e:
    print(f"❌ JSON doğrulama hatası: {e}")




