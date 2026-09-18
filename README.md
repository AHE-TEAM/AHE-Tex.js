# AHETEX

## AHE Texture Engine

**AHETEX** is a lightweight, standalone JavaScript texture engine for texture creation, pixel manipulation, image processing, texture analysis, block compression, mipmap generation, DDS handling, texture atlases, and asynchronous encoding/decoding.

**Current version: 0.3.0**

> AHETEX 0.3.0 kapsamındaki tüm 68 test hatasız şekilde geçmiştir.

[![Version](https://img.shields.io/badge/version-0.3.0-blue.svg)](https://github.com/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](#license)
[![Language](https://img.shields.io/badge/language-JavaScript-yellow.svg)](#)

---

# Türkçe

## AHETEX nedir?

AHETEX (AHE Texture Engine), JavaScript ile geliştirilmiş bağımsız bir texture işleme ve sıkıştırma kütüphanesidir.

Kütüphane; RGBA texture oluşturma, pixel işlemleri, texture dönüşümleri, image processing, analiz, mipmap üretimi, BC/DXT block compression, DDS okuma/yazma, texture atlas oluşturma ve asynchronous API gibi işlemler için kullanılabilir.

AHETEX tarayıcıda veya Node.js ortamında kullanılabilecek şekilde tasarlanmıştır.

## Özellikler

- RGBA8 texture desteği
- Pixel okuma ve yazma
- Texture clone
- Texture boyut ve bellek hesaplama
- Texture validation
- Texture analysis
- Histogram
- Texture comparison
- BC1 / DXT1 encode/decode
- BC2 / DXT3 encode/decode
- BC3 / DXT5 encode/decode
- BC4 encode/decode
- BC5 encode/decode
- Codec sistemi
- Codec sorgulama
- Mipmap üretimi
- Resize
- Crop
- Flip X / Flip Y
- Rotate 90 / 180 / 270
- Grayscale
- Invert
- Brightness
- Contrast
- Alpha işlemleri
- Premultiplied alpha
- Normal map üretimi
- Channel extraction
- Threshold
- Posterize
- Gamma
- Saturation
- Hue rotation
- Sepia
- Tint
- Alpha from luma
- Texture atlas
- DDS read/write/detect
- Async encode/decode
- Format bilgisi
- Power-of-two yardımcıları
- Compression ratio hesaplama

## Desteklenen formatlar

### Doğrulanmış temel formatlar

| Format | Encode | Decode | Açıklama |
|---|---:|---:|---|
| RGBA8 | Texture | Texture | 32-bit RGBA texture |
| BC1 / DXT1 | ✓ | ✓ | 4x4 block, 8 byte |
| BC2 / DXT3 | ✓ | ✓ | 4x4 block, 16 byte |
| BC3 / DXT5 | ✓ | ✓ | 4x4 block, 16 byte |
| BC4 | ✓ | ✓ | 4x4 block, 8 byte |
| BC5 | ✓ | ✓ | 4x4 block, 16 byte |

> Bu tabloda yalnızca AHETEX 0.3.0 testleriyle doğrulanan codec'ler gösterilmiştir.

---

# Kurulum

AHETEX tek bir JavaScript dosyası olarak projeye eklenebilir.

Örnek proje:

    project/
    ├── index.html
    ├── ahetex.js
    └── app.js

`ahetex.js` dosyasını projenize kopyalayın.

## Browser'a ekleme

HTML dosyanıza önce AHETEX'i ekleyin:

```html
<script src="./ahetex.js"></script>
<script src="./app.js"></script>
```

`app.js` çalıştığında `AHETEX` global nesnesi kullanılabilir.

## JavaScript'e dahil etme

```html
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <title>AHETEX Test</title>
</head>
<body>

<script src="./ahetex.js"></script>
<script>
    console.log(AHETEX.VERSION);
</script>

</body>
</html>
```

Çıktı:

    0.3.0

---

# AHETEX nasıl enjekte edilir?

Buradaki "enjekte etmek", AHETEX JavaScript dosyasını bir web sayfasına veya JavaScript projesine dahil etmek anlamındadır.

En basit yöntem HTML içine `<script>` etiketi eklemektir:

```html
<script src="./ahetex.js"></script>
```

Daha sonra kendi kodunuzda:

```html
<script src="./ahetex.js"></script>
<script src="./app.js"></script>
```

`app.js` içerisinde:

```js
const texture = new AHETEX.Texture(
    4,
    4,
    new Uint8Array(4 * 4 * 4),
    AHETEX.FORMATS.RGBA8
);

console.log(texture.width);
console.log(texture.height);
```

Bu yöntem AHETEX'i mevcut web projenize dahil etmenin temel yoludur.

---

# Node.js kullanımı

AHETEX CommonJS ortamında kullanılabilir.

```js
const AHETEX = require("./ahetex.js");

console.log(AHETEX.VERSION);
```

Texture oluşturma:

```js
const AHETEX = require("./ahetex.js");

const data = new Uint8Array(4 * 4 * 4);

const texture = new AHETEX.Texture(
    4,
    4,
    data,
    AHETEX.FORMATS.RGBA8
);

console.log(texture.width);
console.log(texture.height);
```

---

# Texture oluşturma

Temel constructor:

```js
const texture = new AHETEX.Texture(
    width,
    height,
    data,
    format
);
```

Örnek:

```js
const data = new Uint8Array(4 * 4 * 4);

const texture = new AHETEX.Texture(
    4,
    4,
    data,
    AHETEX.FORMATS.RGBA8
);
```

RGBA8 texture'da her pixel 4 byte kullanır:

    4 × 4 × 4 = 64 bytes

---

# Pixel okuma

Pixel değerleri RGBA olarak okunabilir.

```js
const pixel = texture.pixel(0, 0);
console.log(pixel);
```

Bir pixel'in temel yapısı RGBA kanallarından oluşur:

    R G B A

Değerler 0-255 aralığındadır.

# Pixel yazma

```js
texture.setPixel(0, 0, 255, 0, 0, 255);
```

Bu örnekte ilk pixel kırmızı ve tamamen opak yapılır.

---

# Texture clone

Texture'ın kopyasını oluşturmak için:

```js
const copy = texture.clone();
```

Orijinal texture üzerinde yapılan değişikliklerin kopyadan bağımsız tutulması için clone kullanılabilir.

---

# Bellek kullanımı

Texture'ın byte boyutunu öğrenmek için:

```js
const bytes = texture.byteLength();
console.log(bytes);
```

Megabyte karşılığını öğrenmek için:

```js
const mb = texture.memoryMB();
console.log(mb);
```

Örneğin 4x4 RGBA8 texture:

    4 × 4 × 4 = 64 bytes

---

# Validation

Texture'ın geçerli olup olmadığını kontrol etmek için:

```js
const result = texture.validate();
console.log(result);
```

Validation, texture'ın yapısal olarak kullanılabilir durumda olup olmadığını kontrol etmek için kullanılabilir.

---

# Analysis

Texture hakkında analiz bilgisi almak için:

```js
const analysis = texture.analyze();
console.log(analysis);
```

Histogram:

```js
const histogram = texture.histogram();
console.log(histogram);
```

Texture karşılaştırması:

```js
const result = AHETEX.compare(textureA, textureB);
console.log(result);
```

---

# BC1 / DXT1

BC1, 4x4 pixel block başına 8 byte kullanan block compression formatıdır.

```js
const encoded = AHETEX.encode(texture, AHETEX.FORMATS.BC1);
```

Decode:

```js
const decoded = AHETEX.decode(encoded, AHETEX.FORMATS.BC1);
```

DXT1 aliası BC1 ile ilişkilidir.

---

# BC2 / DXT3

BC2, DXT3 olarak da bilinir ve 4x4 block başına 16 byte kullanır.

```js
const encoded = AHETEX.encode(texture, AHETEX.FORMATS.BC2);
```

Decode:

```js
const decoded = AHETEX.decode(encoded, AHETEX.FORMATS.BC2);
```

---

# BC3 / DXT5

BC3, DXT5 olarak da bilinir ve 4x4 block başına 16 byte kullanır.

```js
const encoded = AHETEX.encode(texture, AHETEX.FORMATS.BC3);
```

Decode:

```js
const decoded = AHETEX.decode(encoded, AHETEX.FORMATS.BC3);
```

---

# BC4

BC4, tek kanal texture verileri için kullanılan 4x4 block compression formatıdır.

Bir block 8 byte kullanır.

```js
const encoded = AHETEX.encode(texture, AHETEX.FORMATS.BC4);
```

Decode:

```js
const decoded = AHETEX.decode(encoded, AHETEX.FORMATS.BC4);
```

---

# BC5

BC5 iki kanal için kullanılan block compression formatıdır.

Bir 4x4 block 16 byte kullanır.

```js
const encoded = AHETEX.encode(texture, AHETEX.FORMATS.BC5);
```

Decode:

```js
const decoded = AHETEX.decode(encoded, AHETEX.FORMATS.BC5);
```

---

# Codec sistemi

AHETEX codec sistemi üzerinden kullanılabilir codec'lere erişilebilir.

```js
const codec = AHETEX.getCodec(AHETEX.FORMATS.BC1);
console.log(codec);
```

Örnek codec sorguları:

```js
AHETEX.getCodec(AHETEX.FORMATS.BC1);
AHETEX.getCodec(AHETEX.FORMATS.BC2);
AHETEX.getCodec(AHETEX.FORMATS.BC3);
AHETEX.getCodec(AHETEX.FORMATS.BC4);
AHETEX.getCodec(AHETEX.FORMATS.BC5);
```

0.3.0 testlerinde bu codec sorgularının tamamı başarılıdır.

---

# Mipmap

AHETEX mipmap üretimini destekler.

```js
const mipmaps = AHETEX.generateMipmaps(texture);
```

Mipmap'lar texture'ın daha küçük çözünürlüklerdeki sürümleridir.

Tipik workflow:

    1024x1024
       ↓
     512x512
       ↓
     256x256
       ↓
     128x128
       ↓
      64x64
       ↓
      ...

Mipmap'lar özellikle oyun motorlarında ve 3D rendering işlemlerinde texture sampling performansı ve kalite kontrolü için kullanılabilir.

---

# Resize

Texture yeniden boyutlandırılabilir:

```js
const resized = AHETEX.resize(texture, 128, 128);
```

Texture üzerinde resize işlemi:

```js
texture.resize(128, 128);
```

---

# Crop

Texture'ın belirli bir bölgesini almak için:

```js
const cropped = AHETEX.crop(texture, 0, 0, 64, 64);
```

---

# Flip X

Yatay çevirme:

```js
const flipped = AHETEX.flipX(texture);
```

# Flip Y

Dikey çevirme:

```js
const flipped = AHETEX.flipY(texture);
```

---

# Rotate

90 derece:

```js
const rotated90 = AHETEX.rotate(texture, 90);
```

180 derece:

```js
const rotated180 = AHETEX.rotate(texture, 180);
```

270 derece:

```js
const rotated270 = AHETEX.rotate(texture, 270);
```

---

# Image Processing

## Grayscale

```js
const result = AHETEX.grayscale(texture);
```

## Invert

```js
const result = AHETEX.invert(texture);
```

## Brightness

```js
const result = AHETEX.brightness(texture, value);
```

## Contrast

```js
const result = AHETEX.contrast(texture, value);
```

## Alpha

```js
const result = AHETEX.setAlpha(texture, value);
```

## Premultiply Alpha

```js
const result = AHETEX.premultiplyAlpha(texture);
```

## Unpremultiply Alpha

```js
const result = AHETEX.unpremultiplyAlpha(texture);
```

## Normal Map

```js
const normal = AHETEX.normalMap(texture);
```

## Channel Extraction

```js
const channel = AHETEX.extractChannel(texture, channel);
```

## Threshold

```js
const result = AHETEX.threshold(texture, value);
```

## Posterize

```js
const result = AHETEX.posterize(texture, levels);
```

## Gamma

```js
const result = AHETEX.gamma(texture, value);
```

## Saturation

```js
const result = AHETEX.saturation(texture, value);
```

## Hue Rotate

```js
const result = AHETEX.hueRotate(texture, degrees);
```

## Sepia

```js
const result = AHETEX.sepia(texture, value);
```

## Tint

```js
const result = AHETEX.tint(texture, r, g, b, a);
```

## Alpha From Luma

```js
const result = AHETEX.alphaFromLuma(texture);
```

---

# Texture Atlas

Birden fazla texture'ı atlas halinde düzenlemek için:

```js
const atlas = AHETEX.createAtlas(textures);
```

Texture atlas özellikle oyunlarda çok sayıda küçük texture'ın tek bir texture içinde toplanması için kullanılabilir.

---

# DDS

AHETEX DDS dosyalarıyla çalışabilir.

DDS yazma:

```js
const dds = AHETEX.dds.write(texture);
```

DDS okuma:

```js
const texture = AHETEX.dds.read(dds);
```

DDS algılama:

```js
const isDDS = AHETEX.dds.detect(data);
```

DDS desteği texture pipeline'larında kullanılabilir.

---

# Async API

AHETEX asynchronous encode/decode fonksiyonlarına sahiptir.

```js
const encoded = await AHETEX.encodeAsync(
    texture,
    AHETEX.FORMATS.BC1
);
```

Decode:

```js
const texture = await AHETEX.decodeAsync(
    encoded,
    AHETEX.FORMATS.BC1
);
```

Bu API, özellikle browser uygulamalarında ve daha büyük texture işlemlerinde asynchronous workflow oluşturmak için kullanılabilir.

---

# Format bilgisi

Bir format hakkında bilgi almak için:

```js
const info = AHETEX.getFormatInfo(AHETEX.FORMATS.BC1);
console.log(info);
```

---

# Power of Two

Bir sayının power-of-two olup olmadığını kontrol etmek:

```js
const result = AHETEX.isPowerOfTwo(256);
```

Sonraki power-of-two değerini bulmak:

```js
const value = AHETEX.nextPowerOfTwo(300);
```

---

# Compression Ratio

Texture sıkıştırma oranını hesaplamak için:

```js
const ratio = AHETEX.compressionRatio(
    originalSize,
    compressedSize
);
```

---

# Texture workflow

AHETEX ile örnek bir texture pipeline:

    Image
      ↓
    AHETEX
      ↓
    Texture
      ↓
    Resize
      ↓
    Image Processing
      ↓
    Mipmap
      ↓
    BC Compression
      ↓
    DDS

Bu yapı bir texture converter, texture editor veya oyun modlama aracı içinde kullanılabilir.

---

# Oyun geliştirmede kullanım

AHETEX oyun geliştirme araçlarında texture pipeline oluşturmak için kullanılabilir.

Örneğin:

    Texture dosyası
          ↓
       Decode
          ↓
       Texture
          ↓
      Processing
          ↓
       Resize
          ↓
       Mipmap
          ↓
       BC Codec
          ↓
       DDS / Output

AHETEX doğrudan bir oyun motoru değildir. Texture işlemlerini sağlayan bir JavaScript kütüphanesidir.

---

# WebGL / WebGPU kullanım senaryosu

AHETEX, texture verilerini hazırlayan bir işlem katmanı olarak kullanılabilir.

Örneğin:

```js
const texture = new AHETEX.Texture(
    4,
    4,
    data,
    AHETEX.FORMATS.RGBA8
);

const resized = AHETEX.resize(texture, 256, 256);
```

Daha sonra elde edilen RGBA verileri uygulamanın WebGL/WebGPU texture oluşturma pipeline'ına aktarılabilir.

AHETEX'in kendi başına WebGL/WebGPU renderer olduğu anlamına gelmez; texture verisini hazırlamak için kullanılabilir.

---

# Modlama araçlarında kullanım

AHETEX texture modlama araçlarında aşağıdaki işlemler için kullanılabilir:

- Texture dönüştürme
- Texture yeniden boyutlandırma
- Texture sıkıştırma
- DDS oluşturma
- DDS okuma
- Mipmap oluşturma
- Kanal ayırma
- Normal map oluşturma
- Renk düzenleme
- Texture atlas oluşturma

Örneğin bir modding aracı şu pipeline'ı kullanabilir:

    Input Texture
         ↓
       AHETEX
         ↓
      Process
         ↓
      Compress
         ↓
       Export

---

# Texture converter oluşturma

AHETEX kullanılarak bir texture converter yapılabilir.

Temel mantık:

```js
const texture = AHETEX.dds.read(inputData);
const resized = AHETEX.resize(texture, 512, 512);
const encoded = AHETEX.encode(resized, AHETEX.FORMATS.BC3);
const output = AHETEX.dds.write(encoded);
```

> Gerçek uygulamada kullanılan `read`, `encode` ve `write` çağrılarının parametreleri kullanılan AHETEX sürümündeki API imzasına göre düzenlenmelidir.

---

# Texture editor oluşturma

AHETEX kullanılarak browser tabanlı texture editor yapılabilir.

Örnek işlemler:

```js
let texture = AHETEX.grayscale(texture);
texture = AHETEX.resize(texture, 512, 512);
texture = AHETEX.rotate(texture, 90);
```

Editor arayüzü HTML/CSS ile oluşturulabilir ve texture işlemleri AHETEX'e bırakılabilir.

---

# API özeti

## Texture

- `new AHETEX.Texture(width, height, data, format)`
- `texture.pixel(x, y)`
- `texture.setPixel(x, y, r, g, b, a)`
- `texture.clone()`
- `texture.byteLength()`
- `texture.memoryMB()`
- `texture.validate()`
- `texture.analyze()`
- `texture.histogram()`
- `texture.resize(width, height)`

## Codec

- `AHETEX.encode()`
- `AHETEX.decode()`
- `AHETEX.encodeAsync()`
- `AHETEX.decodeAsync()`
- `AHETEX.getCodec()`

## Texture operations

- `AHETEX.generateMipmaps()`
- `AHETEX.resize()`
- `AHETEX.crop()`
- `AHETEX.flipX()`
- `AHETEX.flipY()`
- `AHETEX.rotate()`

## Image operations

- `AHETEX.grayscale()`
- `AHETEX.invert()`
- `AHETEX.brightness()`
- `AHETEX.contrast()`
- `AHETEX.setAlpha()`
- `AHETEX.premultiplyAlpha()`
- `AHETEX.unpremultiplyAlpha()`
- `AHETEX.normalMap()`
- `AHETEX.extractChannel()`
- `AHETEX.threshold()`
- `AHETEX.posterize()`
- `AHETEX.gamma()`
- `AHETEX.saturation()`
- `AHETEX.hueRotate()`
- `AHETEX.sepia()`
- `AHETEX.tint()`
- `AHETEX.alphaFromLuma()`

## Analysis / utility

- `AHETEX.compare()`
- `AHETEX.getFormatInfo()`
- `AHETEX.isPowerOfTwo()`
- `AHETEX.nextPowerOfTwo()`
- `AHETEX.compressionRatio()`

## DDS / Atlas

- DDS read
- DDS write
- DDS detect
- `AHETEX.createAtlas()`

---

# Test sonucu

AHETEX 0.3.0 için tam test paketi çalıştırılmıştır.

```text
AHETEX 0.3.0 Test
Full API / Codec / Mipmap / DDS / Image Operations Test
TESTİ BAŞLAT
✓ TÜM TESTLER BAŞARILI
Başarılı: 68 | Hatalı: 0 | Atlanan: 0 | Toplam: 68

Passed: 68
Failed: 0
Skipped: 0
Total: 68
```

**Sonuç: 68/68 test başarılı, 0 hata.**

Test edilen alanlar:

- AHETEX mevcut
- AHETEX API
- Version
- FORMATS
- Texture oluşturma
- Texture format
- Pixel okuma
- Pixel yazma
- Texture clone
- byteLength
- memoryMB
- validate
- analyze
- histogram
- BC1 encode
- BC1 decode
- General encode BC1
- General decode BC1
- BC2 encode
- BC2 decode
- BC3 encode
- BC3 decode
- BC4 encode
- BC4 decode
- BC5 encode
- BC5 decode
- generateMipmaps
- resize
- Texture.resize()
- crop
- flipX
- flipY
- rotate 90
- rotate 180
- rotate 270
- grayscale
- invert
- brightness
- contrast
- setAlpha
- premultiplyAlpha
- unpremultiplyAlpha
- compare
- DDS write
- DDS read
- DDS detect
- getCodec BC1
- getCodec BC2
- getCodec BC3
- getCodec BC4
- getCodec BC5
- createAtlas
- normalMap
- extractChannel
- threshold
- posterize
- gamma
- saturation
- hueRotate
- sepia
- tint
- alphaFromLuma
- getFormatInfo
- isPowerOfTwo
- nextPowerOfTwo
- compressionRatio
- decodeAsync
- encodeAsync

---

# Test edilen örnek değerler

Test sırasında kullanılan örnek texture:

    Texture: 4x4

RGBA8 boyutu:

    RGBA8: 64 bytes

BC1:

    BC1: 8 bytes / 4x4

BC3:

    BC3: 16 bytes / 4x4

---

# Mimari

AHETEX tek bir JavaScript modülü olarak dağıtılabilir.

Genel mimari:

    AHETEX
    │
    ├── Texture
    │   ├── Pixel
    │   ├── Resize
    │   ├── Crop
    │   ├── Flip
    │   └── Rotate
    │
    ├── Codecs
    │   ├── BC1
    │   ├── BC2
    │   ├── BC3
    │   ├── BC4
    │   └── BC5
    │
    ├── Image Operations
    │   ├── Grayscale
    │   ├── Invert
    │   ├── Brightness
    │   ├── Contrast
    │   ├── Alpha
    │   ├── Gamma
    │   ├── Saturation
    │   ├── Hue
    │   └── Color Effects
    │
    ├── Analysis
    │   ├── Histogram
    │   ├── Analyze
    │   └── Compare
    │
    ├── Mipmap
    ├── Atlas
    ├── DDS
    └── Async API

---

# Extensibility

AHETEX'in codec tabanlı mimarisi yeni texture codec'lerinin ileride eklenebilmesi için genişletilebilir şekilde tasarlanmıştır.

Codec sistemi sayesinde codec sorgulanabilir:

```js
const codec = AHETEX.getCodec(AHETEX.FORMATS.BC1);
```

Yeni bir codec eklenirken AHETEX'in mevcut codec API'si ve veri yapıları takip edilmelidir.

---

# Bellek örnekleri

RGBA8 formatında temel hesap:

    width × height × 4

4x4 texture:

    4 × 4 × 4 = 64 bytes

BC1 için 4x4 block:

    8 bytes

BC2 için 4x4 block:

    16 bytes

BC3 için 4x4 block:

    16 bytes

BC4 için 4x4 block:

    8 bytes

BC5 için 4x4 block:

    16 bytes

Bu değerler block compression'ın RGBA8'e kıyasla daha az depolama alanı kullanabilmesini açıklar.

---

# Örnek tam Browser projesi

## index.html

```html
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AHETEX Demo</title>
</head>
<body>
    <h1>AHETEX 0.3.0</h1>

    <script src="./ahetex.js"></script>
    <script src="./app.js"></script>
</body>
</html>
```

## app.js

```js
console.log("AHETEX VERSION:", AHETEX.VERSION);

const data = new Uint8Array(4 * 4 * 4);

const texture = new AHETEX.Texture(
    4,
    4,
    data,
    AHETEX.FORMATS.RGBA8
);

console.log("Texture:", texture.width, "x", texture.height);
console.log("Bytes:", texture.byteLength());
console.log("Memory MB:", texture.memoryMB());
```

---

# Güvenlik ve kullanım notu

AHETEX bir JavaScript texture kütüphanesidir. Web sayfasına eklenmesi normal JavaScript dependency kullanımına dayanır.

Kullanıcı verileri veya dosyalar işlenirken uygulamanın kendi dosya erişim ve güvenlik kuralları geçerlidir.

AHETEX tek başına bir dosya yükleme sunucusu, oyun motoru veya güvenlik sistemi değildir.

---

# Sürüm

**AHETEX 0.3.0**

Bu sürümde codec, mipmap, DDS, image operation, analysis, atlas ve async API kapsamındaki testler doğrulanmıştır.

---

# Changelog

## 0.3.0

- BC2 / DXT3 codec
- BC4 codec
- BC5 codec
- Codec API genişletmeleri
- Mipmap desteği
- DDS işlemleri
- Texture işlemleri
- Image processing işlemleri
- Texture analysis
- Histogram
- Texture comparison
- Texture atlas
- Normal map
- Kanal çıkarma
- Threshold
- Posterize
- Gamma
- Saturation
- Hue rotation
- Sepia
- Tint
- Alpha from luma
- Async encode/decode
- Utility API
- Genişletilmiş test paketi
- **68/68 test başarılı**

---

# Proje yapısı

Örnek:

    project/
    ├── ahetex.js
    ├── index.html
    ├── app.js
    ├── README.md
    └── LICENSE

---

# License

MIT License

Copyright (c) 2026 AHE MODS

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

---

# Author

**AHE MODS**

AHETEX - AHE Texture Engine

Copyright (c) 2026 AHE MODS

---

# Credits

AHETEX is developed and maintained by AHE MODS.

When redistributing AHETEX or substantial portions of the project, preserve the copyright and license notice according to the MIT License.

---

# English Documentation

## What is AHETEX?

AHETEX (AHE Texture Engine) is a standalone JavaScript texture processing and compression library.

It provides texture creation, pixel access, image processing, texture analysis, block compression, mipmap generation, DDS handling, texture atlases, codec access, and asynchronous encoding/decoding.

AHETEX can be integrated into browser applications and Node.js projects.

## Features

- RGBA8 texture creation
- Pixel reading and writing
- Texture cloning
- Memory and byte-size calculation
- Validation
- Texture analysis
- Histogram
- Texture comparison
- BC1 / DXT1 encoding and decoding
- BC2 / DXT3 encoding and decoding
- BC3 / DXT5 encoding and decoding
- BC4 encoding and decoding
- BC5 encoding and decoding
- Codec system
- Codec lookup
- Mipmap generation
- Resize
- Crop
- Flip X / Flip Y
- Rotation
- Grayscale
- Invert
- Brightness
- Contrast
- Alpha operations
- Premultiplied alpha
- Normal map generation
- Channel extraction
- Threshold
- Posterize
- Gamma
- Saturation
- Hue rotation
- Sepia
- Tint
- Alpha from luma
- DDS read/write/detection
- Texture atlas creation
- Async encode/decode
- Format information
- Power-of-two utilities
- Compression ratio calculation

## Browser integration

Add AHETEX to your HTML page:

```html
<script src="./ahetex.js"></script>
<script src="./app.js"></script>
```

Then use it from JavaScript:

```js
const data = new Uint8Array(4 * 4 * 4);

const texture = new AHETEX.Texture(
    4,
    4,
    data,
    AHETEX.FORMATS.RGBA8
);
```

## Node.js integration

```js
const AHETEX = require("./ahetex.js");

console.log(AHETEX.VERSION);
```

## Texture creation

```js
const data = new Uint8Array(4 * 4 * 4);

const texture = new AHETEX.Texture(
    4,
    4,
    data,
    AHETEX.FORMATS.RGBA8
);
```

## Pixel access

```js
const pixel = texture.pixel(0, 0);
texture.setPixel(0, 0, 255, 0, 0, 255);
```

## Clone

```js
const copy = texture.clone();
```

## Memory

```js
const bytes = texture.byteLength();
const mb = texture.memoryMB();
```

## Validation and analysis

```js
texture.validate();
texture.analyze();
texture.histogram();
```

## BC1

```js
const encoded = AHETEX.encode(texture, AHETEX.FORMATS.BC1);
const decoded = AHETEX.decode(encoded, AHETEX.FORMATS.BC1);
```

## BC2

```js
const encoded = AHETEX.encode(texture, AHETEX.FORMATS.BC2);
const decoded = AHETEX.decode(encoded, AHETEX.FORMATS.BC2);
```

## BC3

```js
const encoded = AHETEX.encode(texture, AHETEX.FORMATS.BC3);
const decoded = AHETEX.decode(encoded, AHETEX.FORMATS.BC3);
```

## BC4

```js
const encoded = AHETEX.encode(texture, AHETEX.FORMATS.BC4);
const decoded = AHETEX.decode(encoded, AHETEX.FORMATS.BC4);
```

## BC5

```js
const encoded = AHETEX.encode(texture, AHETEX.FORMATS.BC5);
const decoded = AHETEX.decode(encoded, AHETEX.FORMATS.BC5);
```

## Mipmaps

```js
const mipmaps = AHETEX.generateMipmaps(texture);
```

## Resize, crop, flip and rotate

```js
const resized = AHETEX.resize(texture, 256, 256);
const cropped = AHETEX.crop(texture, 0, 0, 128, 128);
const horizontal = AHETEX.flipX(texture);
const vertical = AHETEX.flipY(texture);
const rotated = AHETEX.rotate(texture, 90);
```

## Image processing

```js
const gray = AHETEX.grayscale(texture);
const inverted = AHETEX.invert(texture);
const bright = AHETEX.brightness(texture, value);
const contrast = AHETEX.contrast(texture, value);
const alpha = AHETEX.setAlpha(texture, value);
```

Other tested operations include:

- `premultiplyAlpha`
- `unpremultiplyAlpha`
- `normalMap`
- `extractChannel`
- `threshold`
- `posterize`
- `gamma`
- `saturation`
- `hueRotate`
- `sepia`
- `tint`
- `alphaFromLuma`

## DDS

AHETEX provides DDS read, write and detection functionality.

```js
const dds = AHETEX.dds.write(texture);
const loaded = AHETEX.dds.read(dds);
const detected = AHETEX.dds.detect(data);
```

## Texture atlas

```js
const atlas = AHETEX.createAtlas(textures);
```

## Async API

```js
const encoded = await AHETEX.encodeAsync(
    texture,
    AHETEX.FORMATS.BC1
);

const decoded = await AHETEX.decodeAsync(
    encoded,
    AHETEX.FORMATS.BC1
);
```

## Utilities

```js
AHETEX.getFormatInfo(AHETEX.FORMATS.BC1);
AHETEX.isPowerOfTwo(256);
AHETEX.nextPowerOfTwo(300);
AHETEX.compressionRatio(originalSize, compressedSize);
```

## Test status

AHETEX 0.3.0 has a full test suite covering its API, codecs, mipmaps, DDS operations, image operations, utilities, atlas functionality and asynchronous API.

**All 68 tests passed successfully.**

    Passed: 68
    Failed: 0
    Skipped: 0
    Total: 68

There were no failed or skipped tests in the final 0.3.0 test run.

---

# Final Summary

**AHETEX 0.3.0**

AHE Texture Engine

- JavaScript texture engine
- RGBA8 texture support
- BC1 / BC2 / BC3 / BC4 / BC5 codecs
- Mipmap generation
- DDS support
- Image processing
- Texture analysis
- Texture atlas
- Async API
- Browser integration
- Node.js integration
- **68/68 tests passed**
- **0 failed**
- **0 skipped**

Developed by **AHE MODS**.

Copyright (c) 2026 AHE MODS.
