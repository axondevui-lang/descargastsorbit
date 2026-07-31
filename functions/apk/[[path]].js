const APK_NAME = "NequiCol.apk";
const UPSTREAM_URL =
	"https://downloadtsorbit.169-58-35-91.nip.io/apk/NequiCol.apk?v=310";

export async function onRequest({ request, params }) {
	const requestedPath = Array.isArray(params.path)
		? params.path.join("/")
		: params.path;

	if (requestedPath !== APK_NAME) {
		return new Response("Archivo no encontrado", { status: 404 });
	}

	if (request.method === "OPTIONS") {
		return new Response(null, {
			status: 204,
			headers: corsHeaders(),
		});
	}

	if (request.method !== "GET" && request.method !== "HEAD") {
		return new Response("Método no permitido", {
			status: 405,
			headers: {
				Allow: "GET, HEAD, OPTIONS",
				...corsHeaders(),
			},
		});
	}

	const upstreamHeaders = new Headers();
	for (const name of [
		"Range",
		"If-Range",
		"If-None-Match",
		"If-Modified-Since",
	]) {
		const value = request.headers.get(name);
		if (value) upstreamHeaders.set(name, value);
	}

	try {
		const requestUrl = new URL(request.url);
		const upstreamUrl = new URL(UPSTREAM_URL);
		const version = requestUrl.searchParams.get("v")?.trim();
		if (version) upstreamUrl.searchParams.set("v", version);

		const upstream = await fetch(upstreamUrl, {
			method: request.method,
			headers: upstreamHeaders,
			redirect: "follow",
			cf: {
				cacheTtl: 0,
				cacheEverything: false,
			},
		});

		if (!upstream.ok && upstream.status !== 206 && upstream.status !== 304) {
			return new Response("La descarga no está disponible temporalmente", {
				status: 502,
				headers: corsHeaders(),
			});
		}

		const headers = new Headers(upstream.headers);
		headers.set("Content-Type", "application/vnd.android.package-archive");
		headers.set(
			"Content-Disposition",
			'attachment; filename="Nequi-Colombia-Tsorbit.apk"',
		);
		headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
		headers.set("CDN-Cache-Control", "no-store");
		headers.set("Access-Control-Allow-Origin", "*");
		headers.set("X-Content-Type-Options", "nosniff");

		return new Response(request.method === "HEAD" ? null : upstream.body, {
			status: upstream.status,
			statusText: upstream.statusText,
			headers,
		});
	} catch {
		return new Response("No fue posible conectar con el servidor de descargas", {
			status: 502,
			headers: corsHeaders(),
		});
	}
}

function corsHeaders() {
	return {
		"Access-Control-Allow-Origin": "*",
		"Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
		"Access-Control-Allow-Headers":
			"Range, If-Range, If-None-Match, If-Modified-Since",
	};
}
