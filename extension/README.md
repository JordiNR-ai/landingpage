# NoReels — Extensió de Chrome

Bloqueja Instagram Reels i YouTube Shorts directament al navegador.

## Com instal·lar (Chrome / Edge / Brave)

1. Obre **chrome://extensions** al navegador
2. Activa el **Mode de desenvolupador** (cantonada superior dreta)
3. Fes clic a **"Cargar sin empaquetar"** (_Load unpacked_)
4. Selecciona la carpeta `extension/` d'aquest projecte
5. Llest — la icona de NoReels apareixerà a la barra d'extensions

## Funcionalitats

| Funció | Detalls |
|---|---|
| Bloqueig de YouTube Shorts | Redirigeix `/shorts/VIDEO_ID` → `/watch?v=VIDEO_ID` i amaga la secció Shorts del feed |
| Bloqueig de Instagram Reels | Mostra pantalla de bloqueig en `/reels/` i amaga la pestanya Reels |
| Popup de control | Activa/desactiva cada plataforma independentment |
| Estadístiques setmanals | Compta quants intents de Reels/Shorts han estat bloquejats |
| Reset automàtic | Les estadístiques es reinicien cada 7 dies |

## Estructura de fitxers

```
extension/
  manifest.json          # Configuració de l'extensió (Manifest V3)
  content-youtube.js     # Script injectat a youtube.com
  content-instagram.js   # Script injectat a instagram.com
  content-stats.js       # Helper de comptadors
  popup.html             # UI del popup
  popup.js               # Lògica del popup
  icons/                 # Icones (16px, 48px, 128px) — afegir manualment
```

## Permisos utilitzats

- `storage` — Guardar preferències i estadístiques localment
- `tabs` — Detectar la pestanya activa (no es llegeix cap contingut)
- `host_permissions` per a youtube.com i instagram.com — Injectar els scripts de bloqueig

NoReels no envia cap dada a servidors externs. Tot s'executa localment.
