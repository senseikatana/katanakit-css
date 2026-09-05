// Exporta la documentación del sitio (site/src/content/docs) a dos libros DOCX
// (EN y ES) usando pandoc. Orden de páginas según docsNav de site/theme.config.json.
//
// Uso: node scripts/export-docx.ts
// Salida: export/docx/katanakit-css-docs-{en,es}.docx

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { join, resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const DOCS = join(ROOT, "site", "src", "content", "docs");
const OUT = join(ROOT, "export", "docx");
const PANDOC = process.env.PANDOC_BIN ?? (existsSync(join(homedir(), ".local", "bin", "pandoc"))
	? join(homedir(), ".local", "bin", "pandoc")
	: "pandoc");

type NavItem = {
	label?: string;
	link?: string;
	slug?: string;
	autogenerate?: { directory: string };
};
type NavSection = { label: string; items: NavItem[] };
type ThemeConfig = { description?: string; docsNav: NavSection[] };
type Page = { title: string; description: string; order: number; body: string };

// Las etiquetas de sección de docsNav están en inglés; se traducen para el libro ES.
const ES_LABELS: Record<string, string> = {
	"Start Here": "Empieza aquí",
	"Core Concepts": "Conceptos básicos",
	Utilities: "Utilidades",
	"Layout Mixins": "Mixins de layout",
	Reference: "Referencia",
};

function parseFrontmatter(src: string): { meta: Record<string, string>; body: string } {
	const m = /^---\n([\s\S]*?)\n---\n?/.exec(src);
	if (!m?.[1]) return { meta: {}, body: src };
	const fm = m[1];
	const meta: Record<string, string> = {};
	const unquote = (v: string) => v.trim().replace(/^["']|["']$/g, "");
	const title = /^title:\s*(.+)$/m.exec(fm);
	if (title?.[1]) meta.title = unquote(title[1]);
	const desc = /^description:\s*(.+)$/m.exec(fm);
	if (desc?.[1]) meta.description = unquote(desc[1]);
	const order = /order:\s*(\d+)/.exec(fm);
	if (order?.[1]) meta.order = order[1];
	return { meta, body: src.slice(m[0].length) };
}

function loadPage(path: string): Page {
	const { meta, body } = parseFrontmatter(readFileSync(path, "utf8"));
	return {
		title: meta.title ?? "Sin título",
		description: meta.description ?? "",
		order: Number(meta.order ?? 999),
		body,
	};
}

/** Aplica fn a cada línea fuera de bloques de código cercado. */
function mapOutsideFences(src: string, fn: (line: string) => string): string {
	let inFence = false;
	return src
		.split("\n")
		.map((line) => {
			if (/^ {0,3}(```|~~~)/.test(line)) {
				inFence = !inFence;
				return line;
			}
			return inFence ? line : fn(line);
		})
		.join("\n");
}

function countDiv(line: string, re: RegExp): number {
	return (line.match(re) ?? []).length;
}

/** Limpia el cuerpo de una página para el libro compilado. */
function transformBody(body: string): string {
	let htmlDepth = 0;
	const DROP = "\u0000DROP\u0000";
	const cleaned = mapOutsideFences(body, (line) => {
		// Bloques HTML sueltos (demos kk-demo): no reproducibles en Word.
		if (htmlDepth > 0) {
			htmlDepth += countDiv(line, /<div\b/g) - countDiv(line, /<\/div>/g);
			return DROP;
		}
		if (/^ {0,3}<div\b/.test(line)) {
			htmlDepth = countDiv(line, /<div\b/g) - countDiv(line, /<\/div>/g);
			return DROP;
		}
		// Imports de MDX (solo sirven para renderizar en el sitio).
		if (/^import\s+"katanakit-css\//.test(line)) return DROP;
		// Enlaces internos del sitio → texto plano; los externos se conservan.
		return line.replace(/\[([^\]]+)\]\(\/[^)]*\)/g, "$1");
	});
	const withoutDropped = cleaned
		.split("\n")
		.filter((l) => l !== DROP)
		.join("\n");
	// El H1 inicial duplica el título del frontmatter; el resto baja un nivel.
	const trimmed = withoutDropped.replace(/^\s+/, "").replace(/^ {0,3}# .+\n+/, "");
	return mapOutsideFences(trimmed, (line) =>
		/^ {0,3}#{1,5} /.test(line) ? `#${line}` : line,
	).trim();
}

/** Resuelve un item de docsNav a rutas de archivo (ordenadas si autogenera). */
function resolveItem(item: NavItem, base: string): string[] {
	if (item.autogenerate?.directory) {
		const dir = join(base, item.autogenerate.directory);
		const files = readdirSync(dir)
			.filter((f) => f.endsWith(".mdx"))
			.map((f) => {
				const page = loadPage(join(dir, f));
				return { path: join(dir, f), order: page.order, name: f };
			});
		files.sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
		return files.map((f) => f.path);
	}
	let rel: string;
	if (item.slug) rel = item.slug;
	else if (item.link) rel = item.link.replace(/^\/+|\/+$/g, "");
	else return [];
	if (rel === "") rel = "index";
	return [join(base, `${rel}.mdx`)];
}

function buildBook(lang: "en" | "es", config: ThemeConfig): string {
	const base = lang === "es" ? join(DOCS, "es") : DOCS;
	const index = loadPage(join(base, "index.mdx"));
	const tocTitle = lang === "es" ? "Índice" : "Table of Contents";
	const bookTitle = lang === "es" ? "KatanaKIT CSS — Documentación" : "KatanaKIT CSS — Documentation";

	const parts: string[] = [
		"---",
		`title: "${bookTitle}"`,
		`subtitle: "${index.description.replace(/"/g, '\\"')}"`,
		`lang: ${lang}`,
		`toc-title: "${tocTitle}"`,
		"---",
		"",
	];

	for (const section of config.docsNav) {
		const label =
			lang === "es" ? (ES_LABELS[section.label] ?? section.label) : section.label;
		parts.push(`# ${label}`, "");
		for (const item of section.items) {
			for (const filePath of resolveItem(item, base)) {
				const page = loadPage(filePath);
				parts.push(`## ${page.title}`, "", transformBody(page.body), "");
			}
		}
	}
	return parts.join("\n");
}

/** Referencia de estilos de pandoc con los encabezados en el azul de marca. */
function makeReferenceDoc(refPath: string): void {
	const defaultRef = execFileSync(PANDOC, ["--print-default-data-file", "reference.docx"], {
		maxBuffer: 32 * 1024 * 1024,
	});
	writeFileSync(refPath, defaultRef);
	const patch = `
import re, sys, zipfile, os
path = sys.argv[1]
tmp = path + ".tmp"
zin = zipfile.ZipFile(path)
zout = zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED)
for item in zin.infolist():
    data = zin.read(item.filename)
    if item.filename == "word/styles.xml":
        xml = data.decode("utf-8")
        for style in ("Heading1", "Heading2", "Heading3"):
            block_re = re.compile(r'(<w:style [^>]*w:styleId="%s".*?>)(.*?)(</w:style>)' % style, re.S)
            m = block_re.search(xml)
            if m:
                body = re.sub(r'<w:color w:val="[0-9A-Fa-f]{6}"\\s*/>', '<w:color w:val="%s"/>', m.group(2))
                xml = xml[:m.start()] + m.group(1) + body + m.group(3) + xml[m.end():]
        data = xml.encode("utf-8")
    zout.writestr(item, data)
zout.close()
zin.close()
os.replace(tmp, path)
`;
	try {
		execFileSync("python3", ["-c", patch, refPath], { stdio: "pipe" });
	} catch {
		console.warn("aviso: no se pudo parchear reference.docx (sin python3); se usan los estilos por defecto");
	}
}

function main(): void {
	const config: ThemeConfig = JSON.parse(
		readFileSync(join(ROOT, "site", "theme.config.json"), "utf8"),
	);
	mkdirSync(OUT, { recursive: true });

	const refPath = join(tmpdir(), "katanakit-docx-reference.docx");
	makeReferenceDoc(refPath);

	for (const lang of ["en", "es"] as const) {
		const book = buildBook(lang, config);
		const mdPath = join(tmpdir(), `katanakit-docs-${lang}.md`);
		writeFileSync(mdPath, book);
		const outPath = join(OUT, `katanakit-css-docs-${lang}.docx`);
		execFileSync(
			PANDOC,
			[mdPath, "-f", "markdown", "-t", "docx", "-o", outPath, "--toc", "--toc-depth=2", "--reference-doc", refPath],
			{ stdio: "pipe" },
		);
		const pages = (book.match(/^## /gm) ?? []).length;
		console.log(`✓ ${outPath} (${pages} páginas de contenido)`);
	}
}

main();
