<div align="center">

# ₿ direccionesbitcoin

### Tus claves Bitcoin nacen en tu ordenador. Y no salen de ahí.

**Generador de direcciones Bitcoin SegWit (`bc1q`) con frase semilla BIP39 y cartera de papel en PDF.**
**Descárgalo, desconecta el cable y genera tus direcciones con internet apagado.**

[![Web](https://img.shields.io/badge/web-direccionesbitcoin.com-f7931a?style=for-the-badge&logo=bitcoin&logoColor=white)](https://direccionesbitcoin.com)
![Offline](https://img.shields.io/badge/funciona-100%25%20offline-111?style=for-the-badge)
![Servidores](https://img.shields.io/badge/servidores-0-111?style=for-the-badge)
![Cookies](https://img.shields.io/badge/cookies-0-111?style=for-the-badge)

`BIP39` · `BIP32` · `BIP84` · `P2WPKH bc1q` · `WIF` · `TypeScript` · `Vite`

</div>

---

## 🔒 Por qué ejecutarlo en local, sin internet

Una clave privada solo es segura si **nadie más ha podido verla nunca**. Cuando generas una dirección en una web abierta, tienes que confiar en el servidor que te la sirve, en tu conexión y en todo lo que corre en tu navegador mientras está conectado.

Este repositorio te quita esa confianza de encima:

| Generando en una web online | Generando con este repo, en local y offline |
| --- | --- |
| Confías en que el servidor no cambie el código | **El código lo tienes tú**: puedes leerlo, auditarlo y compilarlo |
| Una página manipulada podría enviar tus claves fuera | **Sin red, no hay a dónde enviarlas** |
| Extensiones y scripts con acceso a internet | El equipo está **físicamente aislado** (*air‑gapped*) |
| No sabes qué versión exacta estás ejecutando | Compruebas la **huella SHA‑256** del archivo que generas |

> 💡 **La idea:** la aleatoriedad, la frase semilla, la clave privada y el PDF se crean dentro de tu navegador, en tu máquina, con el cable de red desconectado. Cuando vuelvas a conectarte, las claves ya estarán en papel, no en ningún servidor.

---

## ✨ Qué hace

- 🔑 **Direcciones SegWit nativas `bc1q`** (P2WPKH), derivación estándar **BIP84** `m/84'/0'/0'/0/0`: comisiones más bajas y compatibles con cualquier wallet moderna.
- 📝 **Frase semilla BIP39** de **12 palabras** (128 bits) o **24 palabras** (256 bits) + clave privada **WIF**.
- 🎲 **Entropía reforzada**: `SHA-256(CSPRNG del sistema ‖ movimientos del ratón/toques ‖ marca de tiempo)`. El generador criptográfico del sistema ya basta; tu azar solo suma, nunca resta.
- 🖨️ **Cartera de papel en PDF A4 plegable**: cara pública (dirección + QR) para recibir y cara secreta (frase + WIF + QR) para recuperar.
- 📦 **Generación masiva**: crea lotes de direcciones para regalar bitcoin en eventos, clases o sorteos, en PDF o CSV (el CSV solo contiene direcciones públicas).
- 📴 **Versión offline en un único HTML**: toda la aplicación en un solo archivo autocontenido, sin dependencias externas, que se abre con doble clic.
- 🌍 Español e inglés.
- ✅ Tests con el vector oficial de BIP84 (`abandon … about → bc1qcr8te4kr609gcawutmrza0j4xv80jy8z306fyu`).

Criptografía basada en las librerías auditadas : `@scure/bip39`, `@scure/bip32`, `@scure/base` y `@noble/hashes`.

---

## 🚀 Uso local y offline paso a paso

### 1. Prepara el archivo (con internet, una sola vez)

Necesitas [Node.js](https://nodejs.org/) 20 o superior.

```bash
git clone https://github.com/danakotech/direccionesbitcoin_fle.git
cd direccionesbitcoin_fle
npm ci          # instala las versiones exactas del package-lock.json
npm test        # verifica la derivación con el vector oficial de BIP84
npm run build   # genera la web y la versión offline
```

Al terminar obtendrás:

```
dist/direccionesbitcoin-offline.html     ← toda la aplicación en un único archivo
dist/direccionesbitcoin-offline.sha256   ← su huella SHA-256
```

### 2. Verifica la huella

```bash
cd dist
sha256sum -c direccionesbitcoin-offline.sha256              # Linux
shasum -a 256 direccionesbitcoin-offline.html               # macOS
certutil -hashfile direccionesbitcoin-offline.html SHA256   # Windows
```

Copia `direccionesbitcoin-offline.html` a un USB.

### 3. Genera tus direcciones sin conexión

1. 🔌 **Desconecta el ordenador de internet**: quita el cable y apaga el Wi‑Fi y el Bluetooth. Lo ideal es un equipo limpio o un sistema *live* (por ejemplo [Tails](https://tails.net/)) que no guarde nada.
2. 📂 Abre `direccionesbitcoin-offline.html` con doble clic en el navegador. La página te confirma *«Sin conexión: modo más seguro activado»*.
3. 🖱️ Mueve el ratón sobre la moneda para añadir azar, elige 12 o 24 palabras y pulsa **Generar dirección**.
4. 🖨️ Descarga el PDF e **imprímelo con una impresora sin red** (o por cable USB). Recórtalo y dóblalo por la línea central.
5. 🧹 Borra el PDF del equipo, vacía la papelera y cierra el navegador **antes** de volver a conectarte.
6. 💸 Envía bitcoin solo a la **dirección `bc1q` de la cara pública**. La cara secreta no se enseña a nadie.

> ¿Prefieres no compilar? La misma versión offline puede descargarse desde la web, con su huella publicada:
> [direccionesbitcoin.com/direccionesbitcoin-offline.html](https://direccionesbitcoin.com/direccionesbitcoin-offline.html)

---

## ⚠️ Úsalo para importes pequeños

Este proyecto está pensado para **propinas, regalos, pruebas y enseñar Bitcoin**, no para guardar tus ahorros. Para cantidades importantes usa una **wallet de hardware**.

- Quien tenga la frase semilla o la clave privada **tiene los fondos**. No se pueden recuperar si se pierden o se roban.
- Un ordenador con malware puede espiar la frase mientras se genera. Por eso el modo offline en un equipo limpio es la opción recomendada.
- Para gastar los fondos, importa la frase en una wallet compatible con BIP84 (Sparrow, Electrum, BlueWallet…) y mueve **todo** el saldo de una vez.

---

## 🛠️ Desarrollo

```bash
npm run dev         # servidor de desarrollo con recarga en caliente
npm run typecheck   # comprobación de tipos con TypeScript
npm test            # tests con Vitest
npm run build       # web ES/EN + versión offline + huella + SEO
```

```
src/
├── lib/wallet.ts   # núcleo criptográfico: entropía, BIP39, BIP84, bech32, WIF
├── lib/pdf.ts      # cartera de papel PDF plegable
├── main.ts         # interfaz, generación individual y masiva
├── scene.ts        # escena 3D de la moneda (Three.js)
└── i18n.ts         # textos en español e inglés
offline.html        # entrada de la versión offline (un único HTML)
tests/              # tests con vectores oficiales
```

---

## 👤 Autor

Creado por **[Félix Loureiro Etcheverría](https://www.felixle.com/)** · [direccionesbitcoin.com](https://direccionesbitcoin.com)

Todos los derechos reservados. Este software se ofrece tal cual, sin garantía de ningún tipo; eres el único responsable de custodiar tus claves.

<div align="center">

**No son tus claves, no son tus bitcoins.**
**Con este repo, son tuyas desde el primer bit.** 🟠

</div>
