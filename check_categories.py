import pandas as pd
import os

DATASET_PATH = r"C:\Users\ulaso\Desktop\fashion-dataset"
STYLES_CSV = os.path.join(DATASET_PATH, "styles.csv")

print("📊 Dataset kategorileri analiz ediliyor...\n")

# CSV'yi yükle
try:
    df = pd.read_csv(STYLES_CSV, on_bad_lines='skip', encoding='utf-8')
except TypeError:
    df = pd.read_csv(STYLES_CSV, error_bad_lines=False, warn_bad_lines=False, encoding='utf-8')

print("="*60)
print("📁 MASTER CATEGORIES (Ana Kategoriler)")
print("="*60)
master_cats = df['masterCategory'].value_counts()
for cat, count in master_cats.items():
    print(f"  {cat:30s} : {count:6d} ürün")

print("\n" + "="*60)
print("📂 SUB CATEGORIES (Alt Kategoriler)")
print("="*60)
sub_cats = df['subCategory'].value_counts()
print(f"Toplam {len(sub_cats)} farklı alt kategori var:\n")
for cat, count in sub_cats.head(30).items():
    print(f"  {cat:40s} : {count:6d} ürün")

if len(sub_cats) > 30:
    print(f"\n  ... ve {len(sub_cats) - 30} alt kategori daha")

print("\n" + "="*60)
print("👕 ARTICLE TYPES (Ürün Tipleri)")
print("="*60)
article_types = df['articleType'].value_counts()
print(f"Toplam {len(article_types)} farklı ürün tipi var:\n")
for art_type, count in article_types.head(40).items():
    print(f"  {art_type:40s} : {count:6d} ürün")

if len(article_types) > 40:
    print(f"\n  ... ve {len(article_types) - 40} ürün tipi daha")

print("\n" + "="*60)
print("🎨 BASE COLOURS (Renkler)")
print("="*60)
colors = df['baseColour'].value_counts()
print(f"Toplam {len(colors)} farklı renk var:\n")
for color, count in colors.head(20).items():
    print(f"  {color:30s} : {count:6d} ürün")

print("\n" + "="*60)
print("📊 ÖZET")
print("="*60)
print(f"Toplam Ürün Sayısı     : {len(df):,}")
print(f"Ana Kategori Sayısı     : {len(master_cats)}")
print(f"Alt Kategori Sayısı     : {len(sub_cats)}")
print(f"Ürün Tipi Sayısı       : {len(article_types)}")
print(f"Renk Sayısı            : {len(colors)}")

# Kategori kombinasyonları
print("\n" + "="*60)
print("🔗 MASTER CATEGORY + SUB CATEGORY Kombinasyonları")
print("="*60)
combinations = df.groupby(['masterCategory', 'subCategory']).size().sort_values(ascending=False)
for (master, sub), count in combinations.head(30).items():
    print(f"  {master:20s} > {sub:30s} : {count:6d} ürün")

