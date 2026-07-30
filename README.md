# Descargas Tsorbit

Proxy de descargas para mantener el dominio de Cloudflare Pages visible mientras
la APK se almacena en Contabo.

## Cloudflare Pages

- Framework preset: `None`
- Build command: vacío
- Build output directory: `/`
- Root directory: `/`

Ruta pública:

```text
https://<proyecto>.pages.dev/apk/NequiCol.apk
```

La Function transmite la APK desde Contabo, conserva solicitudes `Range` para
reanudar descargas y no redirige el navegador al dominio del servidor.
