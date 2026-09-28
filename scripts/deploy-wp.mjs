import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import {
	access,
	cp,
	mkdir,
	readFile,
	readdir,
	stat,
	writeFile,
} from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectDirectory = path.resolve(scriptDirectory, "..");
const buildDirectory = path.join(projectDirectory, "dist");
const buildAssetsDirectory = path.join(buildDirectory, "assets");
const themeDirectory = path.join(projectDirectory, "neturma-theme");
const themeAssetsDirectory = path.join(themeDirectory, "assets");
const defaultTargetDirectory = "D:\\OSPanel\\home\\neturma.local\\wp-content\\themes\\neturma";
const targetDirectory = path.resolve(process.env.WP_THEME_DIR || defaultTargetDirectory);
const defaultPhpExecutable = "D:\\OSPanel\\modules\\PHP-8.4\\php.exe";
const phpExecutable = process.env.PHP_EXE || defaultPhpExecutable;

const exists = async (filePath) => {
	try {
		await access(filePath);
		return true;
	} catch {
		return false;
	}
};

const requireFile = async (filePath) => {
	if (!(await exists(filePath))) {
		throw new Error(`Не найден обязательный файл: ${filePath}`);
	}
};

const transformHtml = (source) => source
	.replace(/<title>[^<]*<\/title>\s*/g, "")
	.replace(/\s*<meta name="robots" content="noindex">/g, "")
	.replace(/\s*<meta name="version"[^>]*>/g, "")
	.replace(/\s*<script type="module" crossorigin src="\/assets\/main-[^"]+\.js"><\/script>/g, "")
	.replace(/\s*<link rel="stylesheet" crossorigin href="\/assets\/main-[^"]+\.css">/g, "")
	.replace(/(["'])\/assets\//g, "$1assets/")
	.replace(
		"<head>",
		'<head>\n    <base href="<?php echo esc_url( trailingslashit( get_template_directory_uri() ) ); ?>">',
	)
	.replace("</head>", "    <?php wp_head(); ?>\n</head>")
	.replace(/(<body[^>]*>)/, "$1<?php wp_body_open(); ?>")
	.replace("</body>", "    <?php wp_footer(); ?>\n</body>");

const copyBuildAssets = async () => {
	await mkdir(themeAssetsDirectory, { recursive: true });
	await cp(buildAssetsDirectory, themeAssetsDirectory, {
		recursive: true,
		force: true,
		filter: (source) => !/^main-[\w-]+\.(?:js|css)$/.test(path.basename(source)),
	});

	const entries = await readdir(buildAssetsDirectory);
	const scriptName = entries.find((name) => /^main-[\w-]+\.js$/.test(name));
	const styleName = entries.find((name) => /^main-[\w-]+\.css$/.test(name));

	if (!scriptName || !styleName) {
		throw new Error("В dist/assets не найдены main-*.js и main-*.css");
	}

	const script = (await readFile(path.join(buildAssetsDirectory, scriptName), "utf8"))
		.replaceAll("/assets/", "assets/");
	const style = (await readFile(path.join(buildAssetsDirectory, styleName), "utf8"))
		.replaceAll("/assets/", "./");

	await writeFile(path.join(themeAssetsDirectory, "main.js"), script, "utf8");
	await writeFile(path.join(themeAssetsDirectory, "main.css"), style, "utf8");
};

const createTemplates = async () => {
	const templates = [
		["index.html", "front-page.php"],
		["404.html", "404.php"],
	];

	for (const [sourceName, targetName] of templates) {
		const sourcePath = path.join(buildDirectory, sourceName);
		await requireFile(sourcePath);
		const html = await readFile(sourcePath, "utf8");
		await writeFile(path.join(themeDirectory, targetName), transformHtml(html), "utf8");
	}
};

const copyThemeScreenshot = async () => {
	const screenshotPath = path.join(buildDirectory, "screenshot.png");
	await requireFile(screenshotPath);
	await cp(screenshotPath, path.join(themeDirectory, "screenshot.png"), { force: true });
};

const validateTheme = async () => {
	const requiredFiles = [
		"style.css",
		"screenshot.png",
		"functions.php",
		"front-page.php",
		"404.php",
		"assets/main.css",
		"assets/main.js",
		"assets/content.js",
		"acf-json/group_neturma_content.json",
	];

	for (const relativePath of requiredFiles) {
		await requireFile(path.join(themeDirectory, relativePath));
	}

	JSON.parse(await readFile(path.join(themeDirectory, "acf-json/group_neturma_content.json"), "utf8"));

	if (await exists(phpExecutable)) {
		for (const fileName of ["functions.php", "front-page.php", "404.php", "index.php"]) {
			const result = spawnSync(phpExecutable, ["-l", path.join(themeDirectory, fileName)], {
				encoding: "utf8",
			});
			if (result.status !== 0) {
				throw new Error(result.stderr || result.stdout || `Ошибка проверки ${fileName}`);
			}
		}
	}
};

const listFiles = async (directory, baseDirectory = directory) => {
	const entries = await readdir(directory, { withFileTypes: true });
	const files = [];

	for (const entry of entries) {
		const entryPath = path.join(directory, entry.name);
		if (entry.isDirectory()) {
			files.push(...await listFiles(entryPath, baseDirectory));
		} else {
			files.push(path.relative(baseDirectory, entryPath));
		}
	}

	return files.sort();
};

const hashFile = async (filePath) => createHash("sha256")
	.update(await readFile(filePath))
	.digest("hex");

const verifyDeployment = async () => {
	const sourceFiles = await listFiles(themeDirectory);
	const targetFiles = await listFiles(targetDirectory);

	if (sourceFiles.length !== targetFiles.length) {
		throw new Error(`Количество файлов не совпадает: ${sourceFiles.length} и ${targetFiles.length}`);
	}

	for (let index = 0; index < sourceFiles.length; index += 1) {
		if (sourceFiles[index] !== targetFiles[index]) {
			throw new Error(`Состав темы не совпадает: ${sourceFiles[index]} и ${targetFiles[index]}`);
		}

		const sourceHash = await hashFile(path.join(themeDirectory, sourceFiles[index]));
		const targetHash = await hashFile(path.join(targetDirectory, targetFiles[index]));
		if (sourceHash !== targetHash) {
			throw new Error(`Файл скопирован с ошибкой: ${sourceFiles[index]}`);
		}
	}

	return sourceFiles.length;
};

const deploy = async () => {
	await requireFile(path.join(buildDirectory, "index.html"));
	await requireFile(path.join(buildDirectory, "404.html"));
	await copyBuildAssets();
	await createTemplates();
	await copyThemeScreenshot();
	await validateTheme();
	await mkdir(path.dirname(targetDirectory), { recursive: true });
	await cp(themeDirectory, targetDirectory, { recursive: true, force: true });
	const fileCount = await verifyDeployment();
	const targetStats = await stat(targetDirectory);

	if (!targetStats.isDirectory()) {
		throw new Error(`Путь темы не является каталогом: ${targetDirectory}`);
	}

	console.log(`Тема НЕтюрьма обновлена: ${targetDirectory}`);
	console.log(`Проверено файлов: ${fileCount}`);
};

deploy().catch((error) => {
	console.error(error.message);
	process.exitCode = 1;
});
