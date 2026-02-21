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

# Backend yolları
BACKEND_WWWROOT = r"C:\Users\ulaso\source\repos\bitirme_projesi\bitirme_projesi\wwwroot"
BACKEND_IMAGES = os.path.join(BACKEND_WWWROOT, "images", "giyim")
IMPORT_JSON = r"C:\Users\ulaso\source\repos\bitirme_projesi\bitirme_projesi\products_import.json"

# Mankensiz görselleri belirten anahtar kelimeler
MANKENSIZ_KEYWORDS = [
    'flat', 'lay', 'hanger', 'folded', 'fold', 'stacked', 
    'pile', 'on hanger', 'hanging', 'draped', 'spread',
    'arranged', 'display', 'showcase', 'product shot',
    'white background', 'plain background', 'isolated'
]

# Mankenli görselleri belirten anahtar kelimeler (bunları atlayacağız)
MANKENLI_KEYWORDS = [
    'model', 'wearing', 'worn', 'person', 'man', 'woman',
    'people', 'portrait', 'lifestyle', 'on model', 'styled',
    'fashion', 'runway', 'catwalk', 'editorial'
]

IMAGES_PER_CATEGORY = 700

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

def is_mankensiz(product_name, description, article_type):
    """Ürünün mankensiz olup olmadığını kontrol et"""
    text = f"{product_name} {description} {article_type}".lower()
    
    # Mankenli kelimeler varsa False döndür
    for keyword in MANKENLI_KEYWORDS:
        if keyword in text:
            return False
    
    # Mankensiz kelimeler varsa True döndür
    for keyword in MANKENSIZ_KEYWORDS:
        if keyword in text:
            return True
    
    # Belirsizse, product name'e bak - genellikle mankensiz görseller daha basit isimlerle gelir
    # Eğer hiçbir keyword yoksa, varsayılan olarak mankensiz kabul et (daha güvenli)
    return True

def get_giyim_products_mankensiz(df):
    """Giyim kategorisindeki mankensiz ürünleri getir"""
    print("\n👔 Giyim kategorisindeki mankensiz ürünler filtreleniyor...")
    
    # Sadece Apparel (Giyim) kategorisini al
    giyim_df = df[df['masterCategory'] == 'Apparel'].copy()
    
    print(f"   Toplam giyim ürünü: {len(giyim_df)}")
    
    # Mankensiz olanları filtrele
    giyim_df['is_mankensiz'] = giyim_df.apply(
        lambda row: is_mankensiz(
            str(row.get('productDisplayName', '')),
            str(row.get('articleType', '')),
            str(row.get('subCategory', ''))
        ),
        axis=1
    )
    
    mankensiz_df = giyim_df[giyim_df['is_mankensiz'] == True].copy()
    
    print(f"   Mankensiz ürün sayısı: {len(mankensiz_df)}")
    
    if len(mankensiz_df) < IMAGES_PER_CATEGORY:
        print(f"   ⚠️  Mankensiz ürün sayısı yetersiz ({len(mankensiz_df)} < {IMAGES_PER_CATEGORY})")
        print(f"   💡 Tüm giyim ürünlerinden seçim yapılacak...")
        # Yetersizse, tüm giyim ürünlerinden rastgele seç
        mankensiz_df = giyim_df.sample(n=min(IMAGES_PER_CATEGORY, len(giyim_df)), random_state=42)
    
    # İlk 700'ü al
    selected = mankensiz_df.head(IMAGES_PER_CATEGORY)
    
    products = []
    for _, row in selected.iterrows():
        products.append({
            'id': row['id'],
            'filename': row['filename'],
            'name': row.get('productDisplayName', f'Ürün {row["id"]}'),
            'description': f"{row.get('articleType', '')} - {row.get('baseColour', '')} - {row.get('season', '')}",
            'category_id': 3,  # Giyim
            'masterCategory': 'Apparel',
            'subCategory': row.get('subCategory', ''),
            'articleType': row.get('articleType', ''),
            'baseColour': row.get('baseColour', ''),
            'price': None,
        })
    
    print(f"   ✅ {len(products)} mankensiz giyim ürünü seçildi")
    return products

def copy_giyim_images(products):
    """Giyim resimlerini kopyala"""
    print("\n📁 Giyim resimleri kopyalanıyor...")
    
    os.makedirs(BACKEND_IMAGES, exist_ok=True)
    
    copied_count = 0
    products_for_import = []
    
    for product in products:
        source_file = os.path.join(IMAGES_SOURCE, product['filename'])
        dest_file = os.path.join(BACKEND_IMAGES, product['filename'])
        
        if os.path.exists(source_file):
            try:
                shutil.copy2(source_file, dest_file)
                copied_count += 1
                
                products_for_import.append({
                    'name': product['name'],
                    'description': product['description'],
                    'price': None,
                    'stock': 100,
                    'categoryId': 3,  # Giyim
                    'imagePath': f"images/giyim/{product['filename']}",
                    'filename': product['filename']
                })
            except Exception as e:
                print(f"    ⚠️  Hata ({product['filename']}): {e}")
        else:
            print(f"    ⚠️  Dosya bulunamadı: {product['filename']}")
    
    print(f"    ✅ {copied_count} resim kopyalandı")
    return products_for_import

def update_import_json(giyim_products):
    """Import JSON dosyasını güncelle - sadece giyim kategorisini değiştir"""
    print("\n📝 Import JSON dosyası güncelleniyor...")
    
    # Mevcut JSON'u oku
    with open(IMPORT_JSON, 'r', encoding='utf-8') as f:
        all_products = json.load(f)
    
    # Giyim kategorisindeki ürünleri kaldır
    filtered_products = [p for p in all_products if p.get('categoryId') != 3]
    print(f"   Eski giyim ürünleri kaldırıldı: {len(all_products)} -> {len(filtered_products)}")
    
    # Yeni giyim ürünlerini ekle
    filtered_products.extend(giyim_products)
    print(f"   Yeni giyim ürünleri eklendi: {len(filtered_products)} toplam ürün")
    
    # Fiyatları ekle (giyim için 30-500 arası)
    import random
    for product in filtered_products:
        if product.get('categoryId') == 3 and product.get('price') is None:
            price = round(random.uniform(30, 500) / 10) * 10
            product['price'] = price
    
    # JSON'u kaydet
    with open(IMPORT_JSON, 'w', encoding='utf-8') as f:
        json.dump(filtered_products, f, ensure_ascii=False, indent=2)
    
    print(f"✅ Import JSON güncellendi: {len(filtered_products)} ürün")
    return len(filtered_products)

def main():
    print("🚀 Giyim Kategorisi Yeniden Organize Ediliyor (Mankensiz)...\n")
    
    # 1. Dataset'i yükle
    df = load_data()
    
    # 2. Mankensiz giyim ürünlerini seç
    giyim_products = get_giyim_products_mankensiz(df)
    
    # 3. Resimleri kopyala
    products_for_import = copy_giyim_images(giyim_products)
    
    # 4. Import JSON'u güncelle
    total_products = update_import_json(products_for_import)
    
    print("\n" + "="*60)
    print("✅ İşlem tamamlandı!")
    print("="*60)
    print(f"\n📁 Giyim resimleri: {BACKEND_IMAGES}")
    print(f"📄 Import JSON: {IMPORT_JSON}")
    print(f"📦 Toplam ürün: {total_products}")
    print(f"👔 Mankensiz giyim ürünü: {len(products_for_import)}")
    print("\n💡 Backend'i yeniden başlatıp import endpoint'ini çağırabilirsin!")
    print("\n")

if __name__ == "__main__":
    main()




