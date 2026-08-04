# Descargas Tsorbit

**Repo oficial de actualizaciones Nequi (APK).**  
Cloudflare Pages: `https://descargastsorbit.pages.dev/apk/NequiCol.apk`

Proxy de descargas: el usuario ve el dominio Pages; el edge descarga desde Contabo.

## Cloudflare Pages

- Framework preset: `None`
- Build command: vacío
- Build output directory: `/`
- Root directory: `/`

Ruta pública:

```text
https://descargastsorbit.pages.dev/apk/NequiCol.apk
```

## Flujo al publicar update Nequi

1. Compilar APK (`npm run apk:build` + `apk:copy`).
2. Subir a Contabo: `/opt/bots/nequi-orbytek/apk/NequiCol.apk`.
3. En este repo, bump `?v=` en `functions/apk/[[path]].js` (NequiCol).
4. Push a `main` → Pages redeploy.
5. En backend Orbytek: `update_latest_version` + force update con URL:
   `https://descargastsorbit.pages.dev/apk/NequiCol.apk?v=...`

Upstream Contabo (HTTPS para Cloudflare Pages):

```text
https://downloadtsorbit.169-58-124-184.nip.io/apk/NequiCol.apk
```
