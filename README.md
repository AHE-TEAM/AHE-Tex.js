# AHETEX - AHE Texture Engine (v0.3.0)

[![Version](https://img.shields.io/badge/version-0.3.0-blue.svg)](https://github.com/AHEMODS/AHETEX)
[![Tests](https://img.shields.io/badge/tests-68%20passed-brightgreen.svg)](https://github.com/AHEMODS/AHETEX)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-Browser%20%7C%20Node.js-orange.svg)](#)

AHETEX (AHE Texture Engine), JavaScript ile geliştirilmiş bağımsız, hafif, performanslı ve genişletilebilir bir texture processing, texture compression, image processing, analysis ve codec kütüphanesidir. Tarayıcı (Browser) ve Node.js ortamlarında sıfır dış bağımlılık (zero-dependency) ile çalışır.

---

## Language / Dil
- 🇹🇷 [Türkçe Dokümantasyon](#türkçe-dokümantasyon)
- 🇬🇧 [English Documentation](#english-documentation)

---

<a name="türkçe-dokümantasyon"></a>
# Türkçe Dokümantasyon

## İçindekiler
1. [AHETEX Nedir?](#1-ahetex-nedir)
2. [Özellikler](#2-özellikler)
3. [Desteklenen Formatlar](#3-desteklenen-formatlar)
4. [Kurulum](#4-kurulum)
5. [Dosyayı Projeye Ekleme](#5-dosyayı-projeye-ekleme)
6. [Browser'da Nasıl Kullanılır?](#6-browserda-nasıl-kullanılır)
7. [Node.js'te Nasıl Kullanılır?](#7-nodejs-te-nasıl-kullanılır)
8. [AHETEX Nasıl "Enjekte Edilir"?](#8-ahetex-nasıl-enjekte-edilir)
9. [Mevcut Bir HTML Sayfasına AHETEX Nasıl Eklenir?](#9-mevcut-bir-html-sayfasına-ahetex-nasıl-eklenir)
10. [JavaScript'e Nasıl Dahil Edilir?](#10-javascript-e-nasıl-dahil-edilir)
11. [Başka Bir Projeye Nasıl Entegre Edilir?](#11-başka-bir-projeye-nasıl-entegre-edilir)
12. [Texture Nasıl Oluşturulur?](#12-texture-nasıl-oluşturulur)
13. [Pixel Nasıl Okunur / Yazılır?](#13-pixel-nasıl-okunur--yazılır)
14. [Texture Nasıl Clone Edilir?](#14-texture-nasıl-clone-edilir)
15. [byteLength ve memoryMB Kullanımı](#15-bytelength-ve-memorymb-kullanımı)
16. [Encode / Decode Kullanımı](#16-encode--decode-kullanımı)
17. [BC1 Kullanımı](#17-bc1-kullanımı)
18. [BC2 Kullanımı](#18-bc2-kullanımı)
19. [BC3 Kullanımı](#19-bc3-kullanımı)
20. [BC4 Kullanımı](#20-bc4-kullanımı)
21. [BC5 Kullanımı](#21-bc5-kullanımı)
22. [Codec Sistemi](#22-codec-sistemi)
23. [Mipmap Kullanımı](#23-mipmap-kullanımı)
24. [Resize](#24-resize)
25. [Crop](#25-crop)
26. [Flip](#26-flip)
27. [Rotate](#27-rotate)
28. [Image Processing İşlemleri](#28-image-processing-işlemleri)
29. [Normal Map](#29-normal-map)
30. [Channel Extraction](#30-channel-extraction)
31. [Texture Analysis](#31-texture-analysis)
32. [Histogram](#32-histogram)
33. [Compare](#33-compare)
34. [DDS Kullanımı](#34-dds-kullanımı)
35. [Texture Atlas](#35-texture-atlas)
36. [Async API](#36-async-api)
37. [Utility API](#37-utility-api)
38. [Oyun Geliştirmede Kullanım](#38-oyun-geliştirmede-kullanım)
39. [WebGL/WebGPU Kullanım Senaryosu](#39-webglwebgpu-kullanım-senaryosu)
40. [Modlama Araçlarında Kullanım](#40-modlama-araçlarında-kullanım)
41. [Texture Converter Oluşturma](#41-texture-converter-oluşturma)
42. [Texture Compressor Oluşturma](#42-texture-compressor-oluşturma)
43. [Texture Editor Oluşturma](#43-texture-editor-oluşturma)
44. [Test Sonucu](#44-test-sonucu)
45. [Mimari](#45-mimari)
46. [Extensibility (Genişletilebilirlik)](#46-extensibility-genişletilebilirlik)
47. [Proje Yapısı](#47-proje-yapısı)
48. [Changelog](#48-changelog)
49. [License](#49-license)
50. [Author & Credits](#50-author--credits)

---

### 1. AHETEX Nedir?
AHETEX (AHE Texture Engine), ham piksel verilerini işlemek, sıkıştırmak, analiz etmek ve DirectDraw Surface (DDS) formatları dahil olmak üzere blok sıkıştırma (BC) standartları arasında dönüştürmek amacıyla tasarlanmış yüksek performanslı bir JavaScript kütüphanesidir. Oyun motorları, web tabanlı görsel düzenleyiciler, 3D grafik işlem hatları ve oyun modlama araçları için kapsamlı çözümler sunar.

### 2. Özellikler
- **Ham ve Sıkıştırılmış Format Desteği:** RGBA8 ham pikseller ile BC1, BC2, BC3, BC4 ve BC5 blok sıkıştırma standartları.
- **Piksel Düzeyinde İşlemler:** Piksellere doğrudan erişim, okuma, yazma, klonlama ve bellek analizleri (`byteLength`, `memoryMB`).
- **Görüntü İşleme Paketi:** Resize, crop, flip, rotate, grayscale, invert, brightness, contrast, setAlpha, premultiplyAlpha, unpremultiplyAlpha, threshold, posterize, gamma, saturation, hueRotate, sepia, tint, alphaFromLuma.
- **Gelişmiş Dokusal İşlemler:** Normal map oluşturma/düzeltme, kanal çıkarma (extractChannel), mipmap zinciri oluşturma (`generateMipmaps`).
- **DDS Konteyner Desteği:** DDS dosyalarını okuma (`read`), yazma (`write`) ve format tespiti (`detect`).
- **Analiz ve Karşılaştırma:** Dokusal entropy, dominant renk, histogram analizi, iki doku arasında MSE/PSNR karşılaştırması ve fark haritası oluşturma.
- **Async API:** Sıkıştırma ve açma işlemlerini bloklamayan yapı ile sunan `encodeAsync` ve `decodeAsync`.
- **Eklenti Mimarisi (Plugin System):** `AHETEX.use()` eklenti entegrasyon desteği.

### 3. Desteklenen Formatlar
| Format | Kodlama Tipi | Blok Boyutu | Bayt / Blok | Açıklama |
| :--- | :--- | :--- | :--- | :--- |
| **RGBA8** | Uncompressed | 1x1 piksel | 4 bayt | Standart 32-bit ham piksel formatı (4 x 4 x 4 = 64 bayt / 4x4 blok) |
| **BC1 / DXT1** | Block Compression | 4x4 piksel | 8 bayt | 1-bit alpha veya alpha'sız RGB sıkıştırma |
| **BC2 / DXT3** | Block Compression | 4x4 piksel | 16 bayt | Keskin (explicit) 4-bit alpha destekli RGB sıkıştırma |
| **BC3 / DXT5** | Block Compression | 4x4 piksel | 16 bayt | Yumuşak (interpolated) alpha destekli RGB sıkıştırma |
| **BC4** | Block Compression | 4x4 piksel | 8 bayt | Tek kanal (Grayscale/Red) sıkıştırma |
| **BC5** | Block Compression | 4x4 piksel | 16 bayt | İki kanal (RG / Tangent Space Normal Map) sıkıştırma |

### 4. Kurulum
AHETEX herhangi bir npm bağımlılığı gerektirmez. Projenize tek bir JavaScript dosyası ekleyerek hemen kullanmaya başlayabilirsiniz.

### 5. Dosyayı Projeye Ekleme
`ahetex.js` dosyasını projenizin kök dizinine veya kaynak klasörüne (`lib/`, `vendor/` veya `assets/`) kopyalayın.

### 6. Browser'da Nasıl Kullanılır?
Script etiketi ile doğrudan çağrıldığında global `AHETEX` nesnesi tanımlanır:
```html
<script src="ahetex.js"></script>
<script>
  console.log("AHETEX Sürümü:", AHETEX.VERSION); // 0.3.0
</script>
