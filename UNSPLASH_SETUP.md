# 🔥 Unsplash API Entegrasyonu - Kurulum Rehberi

## 📋 Adım 1: Unsplash Access Key Alma

1. **Unsplash Developer Portal'a Git:**
   - https://unsplash.com/developers
   - Hesabın yoksa ücretsiz kayıt ol

2. **Yeni Application Oluştur:**
   - "Your apps" bölümüne git
   - "New Application" butonuna tıkla
   - Uygulama adını gir (örn: "E-Ticaret Projesi")
   - "Accept terms" ve "Create application" tıkla

3. **Access Key'i Kopyala:**
   - Oluşturduğun uygulamanın sayfasında
   - "Access Key" veya "Application ID" değerini kopyala
   - ⚠️ Bu key'i kimseyle paylaşma!

## 📝 Adım 2: appsettings.json'a Key Ekleme

1. **Proje klasöründe `appsettings.json` dosyasını aç:**
   ```
   bitirme_projesi/appsettings.json
   ```

2. **Access Key'i ekle:**
   ```json
   {
     "Unsplash": {
       "AccessKey": "BURAYA_KENDI_KEY_İNİ_YAPIŞTIR"
     }
   }
   ```

   Örnek:
   ```json
   {
     "Unsplash": {
       "AccessKey": "abc123xyz789..."
     }
   }
   ```

## 🚀 Adım 3: Kullanım

### Swagger'dan:
```
GET /api/Seed/from-unsplash?countPerCategory=200
```

### Özellikler:
- ✅ Her kategori için Unsplash'tan ilgili fotoğraflar çeker
- ✅ Kategori bazlı search query'ler kullanır
- ✅ Her ürün için farklı fotoğraf seçer
- ✅ Yüksek kaliteli, profesyonel fotoğraflar

### Kategori Eşleştirmeleri:
- **Elektronik** → "electronics technology smartphone laptop"
- **Giyim** → "fashion clothing apparel style"
- **Ayakkabı** → "shoes sneakers footwear"
- **Kozmetik** → "cosmetics makeup beauty skincare"
- **Çanta** → "bag handbag backpack purse"
- **Kitap** → "book reading library novel"

## ⚠️ Önemli Notlar:

1. **Rate Limiting:**
   - Unsplash API ücretsiz planında saatte 50 istek limiti var
   - Her kategori için 10 sayfa çekiyoruz (30 fotoğraf/sayfa)
   - Toplam ~300 fotoğraf/kategori

2. **Access Key Güvenliği:**
   - Key'i asla GitHub'a yükleme!
   - `appsettings.json` dosyasını `.gitignore`'a ekle (eğer yoksa)
   - Production'da environment variable kullan

3. **Fotoğraf Kalitesi:**
   - Unsplash'tan gelen fotoğraflar yüksek kaliteli
   - "regular" size kullanılıyor (~1080px)
   - Her ürün için farklı fotoğraf seçiliyor

## 🔧 Sorun Giderme:

**"Unsplash Access Key bulunamadı" hatası:**
- `appsettings.json` dosyasını kontrol et
- Key'in doğru yazıldığından emin ol
- Backend'i yeniden başlat

**"Rate limit exceeded" hatası:**
- 1 saat bekle veya daha az ürün çek
- `countPerCategory` değerini düşür

**Fotoğraflar gelmiyor:**
- Internet bağlantını kontrol et
- Unsplash API'nin çalıştığından emin ol
- Key'in aktif olduğunu kontrol et


