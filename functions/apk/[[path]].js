const UPSTREAMS = {
	"NequiCol.apk": {
		url: "https://downloadtsorbit.169-58-124-184.nip.io/apk/NequiCol.apk?v=610",
		filename: "Nequi-Colombia-Tsorbit.apk",
	},
	"DaviplataTsorbit.apk": {
		url: "https://downloadtsorbit.169-58-124-184.nip.io/apk/DaviplataTsorbit.apk?v=5",
		filename: "Daviplata-Tsorbit.apk",
	},
};

export async function onRequest({ request, params }) {
	const requestedPath = Array.isArray(params.path)
		? params.path.join("/")
		: params.path;

	const apk = UPSTREAMS[requestedPath];
	if (!apk) {
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
		const upstreamUrl = new URL(apk.url);
		const version = requestUrl.searchParams.get("v")?.trim();
		if (version) upstreamUrl.searchParams.set("v", version);

		// Siempre GET al origen (HEAD del edge a veces falla / CF 502).
		const isHead = request.method === "HEAD";
		if (isHead) {
			upstreamHeaders.delete("Range");
		}

		const upstream = await fetch(upstreamUrl, {
			method: "GET",
			headers: upstreamHeaders,
			redirect: "follow",
			cf: {
				cacheTtl: 86400,
				cacheEverything: true,
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
			`attachment; filename="${apk.filename}"`,
		);
		headers.set("Cache-Control", "public, max-age=3600");
		headers.set("CDN-Cache-Control", "public, max-age=86400");
		headers.set("Access-Control-Allow-Origin", "*");
		headers.set("X-Content-Type-Options", "nosniff");

		return new Response(isHead ? null : upstream.body, {
			status: isHead ? 200 : upstream.status,
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
