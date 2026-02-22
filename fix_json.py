import json
import sys

json_path = r"C:\Users\ulaso\source\repos\bitirme_projesi\bitirme_projesi\products_import.json"

print("🔍 JSON dosyası kontrol ediliyor...")

try:
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    print(f"✅ JSON geçerli! Toplam {len(data)} ürün")
except json.JSONDecodeError as e:
    print(f"❌ JSON hatası bulundu!")
    print(f"   Satır: {e.lineno}")
    print(f"   Pozisyon: {e.colno}")
    print(f"   Hata: {e.msg}")
    print(f"\n🔧 JSON düzeltiliyor...")
    
    # Dosyayı satır satır oku ve düzelt
    with open(json_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Özel karakterleri temizle ve JSON'u düzelt
    # Önce tüm ürünleri ayrı ayrı parse etmeye çalış
    try:
        # JSON array'i parse et
        lines = content.split('\n')
        fixed_lines = []
        in_string = False
        escape_next = False
        
        for i, line in enumerate(lines):
            # Eğer satır 2382 civarındaysa özel kontrol
            if i > 2380 and i < 2390:
                print(f"   Satır {i+1}: {line[:100]}...")
            
            fixed_lines.append(line)
        
        # Tekrar dene
        fixed_content = '\n'.join(fixed_lines)
        
        # JSON'u yeniden oluştur - her ürünü ayrı ayrı parse et
        print("\n📝 JSON yeniden oluşturuluyor...")
        
        # Önce mevcut dosyayı yedekle
        import shutil
        backup_path = json_path + ".backup"
        shutil.copy2(json_path, backup_path)
        print(f"   Yedek: {backup_path}")
        
        # JSON'u satır satır parse et ve geçersiz karakterleri temizle
        products = []
        current_product = {}
        current_key = None
        current_value = ""
        brace_count = 0
        
        # Daha basit yöntem: JSON'u string olarak oku ve düzelt
        with open(json_path, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
        
        # Geçersiz escape karakterlerini düzelt
        content = content.replace('\\n', ' ').replace('\\r', ' ')
        content = content.replace('\n', ' ').replace('\r', ' ')
        
        # JSON parse et
        try:
            # Önce temiz bir JSON oluştur
            products = []
            
            # Manuel parse - daha güvenli
            import re
            # JSON array'i bul
            pattern = r'\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}'
            matches = re.findall(pattern, content)
            
            for match in matches:
                try:
                    product = json.loads(match)
                    # Name ve description'daki özel karakterleri temizle
                    if 'name' in product:
                        product['name'] = product['name'].replace('\n', ' ').replace('\r', ' ').replace('"', "'").strip()
                    if 'description' in product:
                        product['description'] = product['description'].replace('\n', ' ').replace('\r', ' ').replace('"', "'").strip()
                    products.append(product)
                except:
                    continue
            
            print(f"✅ {len(products)} ürün parse edildi")
            
            # Yeni JSON dosyası oluştur
            with open(json_path, 'w', encoding='utf-8') as f:
                json.dump(products, f, ensure_ascii=False, indent=2)
            
            print(f"✅ JSON dosyası düzeltildi ve kaydedildi!")
            print(f"   Toplam {len(products)} ürün")
            
        except Exception as e2:
            print(f"❌ Düzeltme başarısız: {e2}")
            sys.exit(1)
            
    except Exception as e:
        print(f"❌ Hata: {e}")
        sys.exit(1)





