import json
import random

# Fiyat aralıkları (kategori bazlı)
PRICE_RANGES = {
    1: (50, 5000),      # Elektronik (Saatler)
    3: (30, 500),       # Giyim
    4: (100, 1500),     # Ayakkabı
    5: (20, 300),       # Kozmetik
    6: (50, 800),       # Çanta
    7: (10, 200),       # Kitap
}

def add_prices_to_import():
    """Import dosyasına rastgele fiyatlar ekle"""
    print("💰 Fiyatlar ekleniyor...")
    
    with open('products_import.json', 'r', encoding='utf-8') as f:
        products = json.load(f)
    
    for product in products:
        category_id = product['categoryId']
        min_price, max_price = PRICE_RANGES.get(category_id, (10, 500))
        
        # Rastgele fiyat (10'un katları)
        price = round(random.uniform(min_price, max_price) / 10) * 10
        product['price'] = price
    
    # Güncellenmiş dosyayı kaydet
    with open('products_import.json', 'w', encoding='utf-8') as f:
        json.dump(products, f, ensure_ascii=False, indent=2)
    
    print(f"✅ {len(products)} ürün için fiyatlar eklendi")
    print(f"   Fiyat aralıkları:")
    for cat_id, (min_p, max_p) in PRICE_RANGES.items():
        print(f"   - Kategori {cat_id}: {min_p}₺ - {max_p}₺")

if __name__ == "__main__":
    add_prices_to_import()

