import os
import shutil
from pathlib import Path

# Yollar
SOURCE_PATH = os.path.join(os.getcwd(), "public", "images")
BACKEND_WWWROOT = r"C:\Users\ulaso\source\repos\bitirme_projesi\bitirme_projesi\wwwroot"
DEST_PATH = os.path.join(BACKEND_WWWROOT, "images")

def copy_images():
    """Resimleri backend wwwroot'a kopyala"""
    print("📦 Resimler backend'e kopyalanıyor...")
    print(f"   Kaynak: {SOURCE_PATH}")
    print(f"   Hedef: {DEST_PATH}")
    
    if not os.path.exists(SOURCE_PATH):
        print(f"❌ Kaynak klasör bulunamadı: {SOURCE_PATH}")
        return False
    
    # Hedef klasörü oluştur
    os.makedirs(DEST_PATH, exist_ok=True)
    
    # Kategori klasörlerini kopyala
    categories = ['elektronik', 'giyim', 'ayakkabı', 'kozmetik', 'çanta']
    total_files = 0
    
    for category in categories:
        source_category = os.path.join(SOURCE_PATH, category)
        dest_category = os.path.join(DEST_PATH, category)
        
        if os.path.exists(source_category):
            os.makedirs(dest_category, exist_ok=True)
            
            # Dosyaları kopyala
            files = [f for f in os.listdir(source_category) if f.endswith('.jpg')]
            for file in files:
                src_file = os.path.join(source_category, file)
                dst_file = os.path.join(dest_category, file)
                shutil.copy2(src_file, dst_file)
                total_files += 1
            
            print(f"   ✅ {category}: {len(files)} dosya kopyalandı")
        else:
            print(f"   ⚠️  {category} klasörü bulunamadı")
    
    print(f"\n✅ Toplam {total_files} resim başarıyla kopyalandı!")
    print(f"📁 Hedef: {DEST_PATH}")
    return True

if __name__ == "__main__":
    copy_images()




