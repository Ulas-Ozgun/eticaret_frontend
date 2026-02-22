import pandas as pd
import os
import shutil
import json
import random

# Yollar
DATASET_PATH = r"C:\Users\ulaso\Desktop\fashion-dataset"
IMAGES_SOURCE = os.path.join(DATASET_PATH, "images")
STYLES_CSV = os.path.join(DATASET_PATH, "styles.csv")
IMAGES_CSV = os.path.join(DATASET_PATH, "images.csv")

# Backend yolları
BACKEND_WWWROOT = r"C:\Users\ulaso\source\repos\bitirme_projesi\bitirme_projesi\wwwroot"
IMPORT_JSON = r"C:\Users\ulaso\source\repos\bitirme_projesi\bitirme_projesi\products_import.json"

# Yeni kategoriler
NEW_CATEGORIES = {
    8: {
        'name': 'Mücevher',
        'subCategory': 'Jewellery',
        'keywords': ['jewellery', 'jewelry', 'earrings', 'bracelet', 'necklace', 'ring', 'pendant']
    },
    9: {
        'name': 'Gözlük',
        'subCategory': 'Eyewear',
        'keywords': ['eyewear', 'sunglasses', 'glasses', 'spectacles']
    },
    10: {
        'name': 'Parfüm',
        'subCategory': 'Fragrance',
        'keywords': ['fragrance', 'perfume', 'body mist', 'deodorant', 'cologne']
    }
}

IMAGES_PER_CATEGORY = 700

# Fiyat aralıkları
PRICE_RANGES = {
    8: (100, 5000),   # Mücevher
    9: (50, 2000),    # Gözlük
    10: (50, 1500),   # Parfüm
}

def load_data():
    """Dataset CSV dosyalarını yükle"""
    print("📊 Dataset yükleniyor...")
    try:
        styles_df = pd.read_csv(STYLES_CSV, on_bad_lines='skip', encoding='utf-8')
    except TypeError:
        styles_df = pd.read_csv(STYLES_CSV, error_bad_lines=False, warn_bad_lines=False, encoding='utf-8')
    
    try:
        images_df = pd.read_csv(IMAGES_CSV, on_bad_lines='skip', encoding='utf-8')
    except TypeError:
        images_df = pd.read_csv(IMAGES_CSV, error_bad_lines=False, warn_bad_lines=False, encoding='utf-8')
    
    images_df['filename'] = images_df['filename'].astype(str)
    images_df['filename'] = images_df['filename'].apply(lambda x: x if x.endswith('.jpg') else f"{x}.jpg")
    
    styles_df['id'] = styles_df['id'].astype(str)
    images_df['id_from_filename'] = images_df['filename'].str.replace('.jpg', '', regex=False)
    
    merged_df = styles_df.merge(images_df, left_on='id', right_on='id_from_filename', how='inner')
    
    print(f"✅ Toplam {len(merged_df)} ürün bulundu")
    return merged_df

def get_products_by_category(df, category_id, category_info):
    """Belirli bir kategoriden ürünleri getir"""
    print(f"\n🔍 {category_info['name']} kategorisi filtreleniyor...")
    
    # SubCategory'ye göre filtrele
    filtered = df[df['subCategory'] == category_info['subCategory']].copy()
    
    print(f"   {category_info['subCategory']} alt kategorisinde {len(filtered)} ürün bulundu")
    
    # İlk 700'ü seç
    selected = filtered.head(IMAGES_PER_CATEGORY)
    
    products = []
    for _, row in selected.iterrows():
        products.append({
            'id': row['id'],
            'filename': row['filename'],
            'name': row.get('productDisplayName', f'Ürün {row["id"]}'),
            'description': f"{row.get('articleType', '')} - {row.get('baseColour', '')} - {row.get('season', '')}",
            'category_id': category_id,
            'price': round(random.uniform(PRICE_RANGES[category_id][0], PRICE_RANGES[category_id][1]) / 10) * 10
        })
    
    print(f"   ✅ {len(products)} ürün seçildi")
    return products

def copy_images(products, category_name):
    """Resimleri backend'e kopyala"""
    print(f"\n📁 {category_name} resimleri kopyalanıyor...")
    
    category_folder = os.path.join(BACKEND_WWWROOT, "images", category_name.lower())
    os.makedirs(category_folder, exist_ok=True)
    
    copied_count = 0
    products_for_import = []
    
    for product in products:
        source_file = os.path.join(IMAGES_SOURCE, product['filename'])
        dest_file = os.path.join(category_folder, product['filename'])
        
        if os.path.exists(source_file):
            try:
                shutil.copy2(source_file, dest_file)
                copied_count += 1
                
                products_for_import.append({
                    'name': product['name'],
                    'description': product['description'],
                    'price': product['price'],
                    'stock': 100,
                    'categoryId': product['category_id'],
                    'imagePath': f"images/{category_name.lower()}/{product['filename']}",
                    'filename': product['filename']
                })
            except Exception as e:
                print(f"    ⚠️  Hata ({product['filename']}): {e}")
        else:
            print(f"    ⚠️  Dosya bulunamadı: {product['filename']}")
    
    print(f"    ✅ {copied_count} resim kopyalandı")
    return products_for_import

def update_import_json(new_products_list):
    """Import JSON dosyasını güncelle"""
    print("\n📝 Import JSON dosyası güncelleniyor...")
    
    # Mevcut JSON'u oku
    with open(IMPORT_JSON, 'r', encoding='utf-8') as f:
        all_products = json.load(f)
    
    # Yeni ürünleri ekle
    for products in new_products_list:
        all_products.extend(products)
    
    # NaN değerleri temizle
    for product in all_products:
        if not product.get('name') or str(product.get('name')).lower() == 'nan':
            product['name'] = product.get('description', f"Ürün {product.get('filename', '')}")
        if not product.get('description') or str(product.get('description')).lower() == 'nan':
            product['description'] = product.get('name', 'Ürün Açıklaması')
    
    # JSON'u kaydet
    with open(IMPORT_JSON, 'w', encoding='utf-8') as f:
        json.dump(all_products, f, ensure_ascii=False, indent=2)
    
    print(f"✅ Import JSON güncellendi: {len(all_products)} toplam ürün")
    return len(all_products)

def main():
    print("🚀 Yeni Kategoriler Ekleniyor...\n")
    print("="*60)
    
    # 1. Dataset'i yükle
    df = load_data()
    
    # 2. Her kategori için ürünleri seç ve kopyala
    all_new_products = []
    
    for category_id, category_info in NEW_CATEGORIES.items():
        print(f"\n{'='*60}")
        print(f"📦 {category_info['name']} (ID: {category_id})")
        print(f"{'='*60}")
        
        # Ürünleri seç
        products = get_products_by_category(df, category_id, category_info)
        
        # Resimleri kopyala
        products_for_import = copy_images(products, category_info['name'])
        
        all_new_products.append(products_for_import)
    
    # 3. Import JSON'u güncelle
    total_products = update_import_json(all_new_products)
    
    print("\n" + "="*60)
    print("✅ İşlem tamamlandı!")
    print("="*60)
    print(f"\n📦 Toplam ürün: {total_products}")
    print(f"📁 Resimler: {BACKEND_WWWROOT}\\images\\")
    print(f"📄 Import JSON: {IMPORT_JSON}")
    print("\n💡 Backend'de kategorileri eklemek için:")
    print("   Swagger'dan POST /api/Category endpoint'ini kullan:")
    for cat_id, cat_info in NEW_CATEGORIES.items():
        print(f"   - ID: {cat_id}, Name: {cat_info['name']}")
    print("\n")

if __name__ == "__main__":
    main()





