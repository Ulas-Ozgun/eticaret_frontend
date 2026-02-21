import pandas as pd
import os
import shutil
import json
from pathlib import Path

# Yollar
DATASET_PATH = r"C:\Users\ulaso\Desktop\fashion-dataset"
IMAGES_SOURCE = os.path.join(DATASET_PATH, "images")
STYLES_CSV = os.path.join(DATASET_PATH, "styles.csv")
IMAGES_CSV = os.path.join(DATASET_PATH, "images.csv")

# Kategori eşleştirmeleri (Dataset kategorileri -> Proje kategorileri)
CATEGORY_MAPPING = {
    # Elektronik (ID: 1) - Watches, Electronics
    "Watches": 1,
    "Electronics": 1,
    
    # Giyim (ID: 3) - Apparel
    "Apparel": 3,
    
    # Ayakkabı (ID: 4) - Footwear
    "Footwear": 4,
    
    # Kozmetik (ID: 5) - Personal Care
    "Personal Care": 5,
    
    # Çanta (ID: 6) - Bags
    "Bags": 6,
    "Handbags": 6,
    "Laptop Bag": 6,
    "Backpacks": 6,
}

# Kategori isimleri (proje kategorileri)
CATEGORY_NAMES = {
    1: "Elektronik",
    3: "Giyim",
    4: "Ayakkabı",
    5: "Kozmetik",
    6: "Çanta",
    7: "Kitap"  # Kitap için dataset'te veri yok
}

# Her kategoriden kaç resim
IMAGES_PER_CATEGORY = 700

def load_data():
    """Dataset CSV dosyalarını yükle"""
    print("📊 Dataset yükleniyor...")
    # CSV okuma hatalarını tolere et
    try:
        styles_df = pd.read_csv(STYLES_CSV, on_bad_lines='skip', encoding='utf-8')
    except TypeError:
        # Eski pandas versiyonu için
        styles_df = pd.read_csv(STYLES_CSV, error_bad_lines=False, warn_bad_lines=False, encoding='utf-8')
    
    try:
        images_df = pd.read_csv(IMAGES_CSV, on_bad_lines='skip', encoding='utf-8')
    except TypeError:
        images_df = pd.read_csv(IMAGES_CSV, error_bad_lines=False, warn_bad_lines=False, encoding='utf-8')
    
    # images.csv'deki filename'i düzelt (zaten .jpg uzantılı olabilir)
    images_df['filename'] = images_df['filename'].astype(str)
    images_df['filename'] = images_df['filename'].apply(lambda x: x if x.endswith('.jpg') else f"{x}.jpg")
    
    # styles ve images'i birleştir
    # styles'deki id ile images'deki filename'i eşleştir (filename id'den oluşuyor)
    styles_df['id'] = styles_df['id'].astype(str)
    images_df['id_from_filename'] = images_df['filename'].str.replace('.jpg', '', regex=False)
    
    merged_df = styles_df.merge(images_df, left_on='id', right_on='id_from_filename', how='inner')
    
    print(f"✅ Toplam {len(merged_df)} ürün bulundu")
    return merged_df

def categorize_products(df):
    """Ürünleri kategorilere göre eşleştir"""
    print("\n🔍 Kategorilere göre eşleştirme yapılıyor...")
    
    categorized = {}
    
    for _, row in df.iterrows():
        category_id = None
        
        # Önce masterCategory'ye bak
        master_cat = str(row.get('masterCategory', '')).strip()
        sub_cat = str(row.get('subCategory', '')).strip()
        article_type = str(row.get('articleType', '')).strip()
        
        # Çanta kontrolü (Bags, Handbags, Laptop Bag, Backpacks)
        if 'bag' in sub_cat.lower() or 'bag' in article_type.lower() or 'backpack' in article_type.lower():
            category_id = 6
        # Watches kontrolü
        elif 'watch' in sub_cat.lower() or 'watch' in article_type.lower():
            category_id = 1
        # Footwear kontrolü
        elif master_cat == 'Footwear':
            category_id = 4
        # Personal Care kontrolü
        elif master_cat == 'Personal Care':
            category_id = 5
        # Apparel kontrolü
        elif master_cat == 'Apparel':
            category_id = 3
        # Eğer mapping'de varsa
        elif master_cat in CATEGORY_MAPPING:
            category_id = CATEGORY_MAPPING[master_cat]
        elif sub_cat in CATEGORY_MAPPING:
            category_id = CATEGORY_MAPPING[sub_cat]
        
        if category_id:
            if category_id not in categorized:
                categorized[category_id] = []
            
            categorized[category_id].append({
                'id': row['id'],
                'filename': row['filename'],
                'name': row.get('productDisplayName', f'Ürün {row["id"]}'),
                'description': f"{row.get('articleType', '')} - {row.get('baseColour', '')} - {row.get('season', '')}",
                'category_id': category_id,
                'masterCategory': master_cat,
                'subCategory': sub_cat,
                'articleType': article_type,
                'baseColour': row.get('baseColour', ''),
                'price': None,  # Fiyat backend'de rastgele atanabilir
            })
    
    # Her kategori için sayıları göster
    print("\n📈 Kategori dağılımı:")
    for cat_id, products in categorized.items():
        print(f"  {CATEGORY_NAMES[cat_id]} (ID: {cat_id}): {len(products)} ürün")
    
    return categorized

def copy_images_to_wwwroot(categorized_products):
    """Resimleri wwwroot/images/kategori klasörlerine kopyala"""
    print("\n📁 Resimler kopyalanıyor...")
    
    # wwwroot klasörünü bul (backend projesinde olmalı)
    # Önce mevcut projede public/images kontrol et
    wwwroot_base = os.path.join(os.getcwd(), "public", "images")
    
    # Eğer yoksa, backend projesi başka yerde olabilir
    # Şimdilik public/images kullanacağız, sonra backend'e taşınabilir
    if not os.path.exists(wwwroot_base):
        os.makedirs(wwwroot_base, exist_ok=True)
    
    copied_count = {}
    products_for_import = {}
    
    for category_id, products in categorized_products.items():
        category_name = CATEGORY_NAMES[category_id]
        category_folder = os.path.join(wwwroot_base, category_name.lower())
        os.makedirs(category_folder, exist_ok=True)
        
        # Her kategoriden 700 resim seç
        selected_products = products[:IMAGES_PER_CATEGORY]
        copied_count[category_id] = 0
        products_for_import[category_id] = []
        
        print(f"\n  📦 {category_name} kategorisi işleniyor...")
        
        for product in selected_products:
            source_file = os.path.join(IMAGES_SOURCE, product['filename'])
            dest_file = os.path.join(category_folder, product['filename'])
            
            if os.path.exists(source_file):
                try:
                    shutil.copy2(source_file, dest_file)
                    copied_count[category_id] += 1
                    
                    # Import için ürün bilgisi
                    products_for_import[category_id].append({
                        'name': product['name'],
                        'description': product['description'],
                        'price': None,  # Backend'de rastgele fiyat atanabilir
                        'stock': 100,  # Varsayılan stok
                        'categoryId': category_id,
                        'imagePath': f"images/{category_name.lower()}/{product['filename']}",
                        'filename': product['filename']
                    })
                except Exception as e:
                    print(f"    ⚠️  Hata ({product['filename']}): {e}")
            else:
                print(f"    ⚠️  Dosya bulunamadı: {product['filename']}")
        
        print(f"    ✅ {copied_count[category_id]} resim kopyalandı")
    
    return products_for_import, wwwroot_base

def generate_import_file(products_for_import):
    """Backend için import dosyası oluştur"""
    print("\n📝 Import dosyası oluşturuluyor...")
    
    all_products = []
    for category_id, products in products_for_import.items():
        all_products.extend(products)
    
    # JSON formatında kaydet
    import_file = os.path.join(os.getcwd(), "products_import.json")
    with open(import_file, 'w', encoding='utf-8') as f:
        json.dump(all_products, f, ensure_ascii=False, indent=2)
    
    print(f"✅ {len(all_products)} ürün bilgisi {import_file} dosyasına kaydedildi")
    
    # CSV formatında da kaydet (opsiyonel)
    import_csv = os.path.join(os.getcwd(), "products_import.csv")
    df = pd.DataFrame(all_products)
    df.to_csv(import_csv, index=False, encoding='utf-8-sig')
    print(f"✅ CSV formatı: {import_csv}")
    
    return import_file

def main():
    print("🚀 Dataset Organizasyon Scripti Başlatılıyor...\n")
    
    # 1. Dataset'i yükle
    df = load_data()
    
    # 2. Kategorilere göre eşleştir
    categorized = categorize_products(df)
    
    # 3. Resimleri kopyala
    products_for_import, wwwroot_path = copy_images_to_wwwroot(categorized)
    
    # 4. Import dosyası oluştur
    import_file = generate_import_file(products_for_import)
    
    print("\n" + "="*60)
    print("✅ İşlem tamamlandı!")
    print("="*60)
    print(f"\n📁 Resimler: {wwwroot_path}")
    print(f"📄 Import dosyası: {import_file}")
    print("\n💡 Sonraki adımlar:")
    print("  1. Backend wwwroot klasörüne resimleri kopyala")
    print("  2. Backend'de import endpoint'i oluştur veya")
    print("  3. products_import.json dosyasını kullanarak ürünleri ekle")
    print("\n")

if __name__ == "__main__":
    main()

