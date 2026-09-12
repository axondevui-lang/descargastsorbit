const UPSTREAMS = {
	"NequiCol.apk": {
		url: "https://github.com/axondevui-lang/descargastsorbit/releases/download/v15.5.1/NequiCol-15.5.1.apk",
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
		return new Response("Not found", { status: 404 });
	}

	const upstream = await fetch(apk.url, {
		headers: {
			"User-Agent": request.headers.get("User-Agent") || "Tsorbit-APK-Proxy",
		},
		redirect: "follow",
	});
	if (!upstream.ok) {
		return new Response(`Upstream ${upstream.status}`, { status: 502 });
	}

	const headers = new Headers(upstream.headers);
	headers.set("Content-Type", "application/vnd.android.package-archive");
	headers.set("Content-Disposition", `attachment; filename="${apk.filename}"`);
	headers.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
	return new Response(upstream.body, { status: 200, headers });
}
