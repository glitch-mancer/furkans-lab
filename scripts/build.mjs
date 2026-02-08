import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";
import { marked } from "marked";

marked.setOptions({ mangle: false, headerIds: false });

const root = process.cwd();
const distDir = path.join(root, "dist");
const contentDir = path.join(root, "content", "blog");
const templatePath = path.join(root, "templates", "post.html");

const escapeHtml = (value = "") =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");

const ensureDir = async (dir) => {
  await fs.mkdir(dir, { recursive: true });
};

const copyDir = async (src, dest) => {
  await ensureDir(dest);
  const entries = await fs.readdir(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }
};

const readPosts = async () => {
  const files = await fs.readdir(contentDir, { withFileTypes: true });
  const posts = [];
  for (const file of files) {
    if (!file.isFile() || !file.name.endsWith(".md")) {
      continue;
    }
    const filePath = path.join(contentDir, file.name);
    const raw = await fs.readFile(filePath, "utf8");
    const { data, content } = matter(raw);
    const slug = data.slug || file.name.replace(/\.md$/, "");
    const date = data.date ? new Date(data.date) : new Date();
    const titleTr = data.title_tr || data.title || slug;
    const titleEn = data.title_en || data.title || titleTr;
    const excerptTr = data.excerpt_tr || data.excerpt || "";
    const excerptEn = data.excerpt_en || data.excerpt || excerptTr;
    const bodyTrMd = data.body_tr || content || "";
    const bodyEnMd = data.body_en || data.body_tr || content || "";
    const cover = data.cover ? data.cover : "";
    const tags = Array.isArray(data.tags) ? data.tags : [];

    posts.push({
      slug,
      date,
      titleTr,
      titleEn,
      excerptTr,
      excerptEn,
      bodyTrHtml: marked.parse(bodyTrMd),
      bodyEnHtml: marked.parse(bodyEnMd),
      cover,
      tags,
    });
  }

  return posts.sort((a, b) => b.date - a.date);
};

const renderPost = (template, post) => {
  const dateTr = post.date.toLocaleDateString("tr-TR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const dateEn = post.date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const tagsHtml = post.tags.length
    ? `<div class="post-tags">${post.tags
        .map((tag) => `<span class="card-tag">${escapeHtml(tag)}</span>`)
        .join("")}</div>`
    : "";
  const coverHtml = post.cover
    ? `<div class="post-cover"><img src="${post.cover}" alt="${escapeHtml(post.titleTr)}" loading="lazy" /></div>`
    : "";

  return template
    .replaceAll("{{title_tr}}", escapeHtml(post.titleTr))
    .replaceAll("{{title_en}}", escapeHtml(post.titleEn))
    .replaceAll("{{excerpt_tr}}", escapeHtml(post.excerptTr))
    .replaceAll("{{excerpt_en}}", escapeHtml(post.excerptEn))
    .replaceAll("{{date_tr}}", escapeHtml(dateTr))
    .replaceAll("{{date_en}}", escapeHtml(dateEn))
    .replaceAll("{{date_iso}}", post.date.toISOString())
    .replaceAll("{{tags}}", tagsHtml)
    .replaceAll("{{cover}}", coverHtml)
    .replaceAll("{{content_tr}}", post.bodyTrHtml)
    .replaceAll("{{content_en}}", post.bodyEnHtml);
};

const build = async () => {
  await fs.rm(distDir, { recursive: true, force: true });
  await ensureDir(distDir);

  const posts = await readPosts();
  const postTemplate = await fs.readFile(templatePath, "utf8");

  const blogCards = posts
    .map((post) => {
      const cover = post.cover
        ? `<div class="card-cover"><img src="${post.cover}" alt="${escapeHtml(
            post.titleTr
          )}" loading="lazy" /></div>`
        : "";
      return `
        <article class="card">
          ${cover}
          <span class="card-badge"><span class="tr">Blog</span><span class="en">Blog</span></span>
          <h3 class="card-title"><span class="tr">${escapeHtml(post.titleTr)}</span><span class="en">${escapeHtml(
        post.titleEn
      )}</span></h3>
          <p class="card-text"><span class="tr">${escapeHtml(
            post.excerptTr
          )}</span><span class="en">${escapeHtml(post.excerptEn)}</span></p>
          <a class="card-link" href="blog/${post.slug}/"><span class="tr">Devamını Oku</span><span class="en">Read More</span></a>
        </article>
      `;
    })
    .join("");

  const latestCards = posts
    .slice(0, 2)
    .map((post) => {
      return `
        <article class="card">
          <span class="card-badge"><span class="tr">Blog</span><span class="en">Blog</span></span>
          <h3 class="card-title"><span class="tr">${escapeHtml(post.titleTr)}</span><span class="en">${escapeHtml(
        post.titleEn
      )}</span></h3>
          <p class="card-text"><span class="tr">${escapeHtml(
            post.excerptTr
          )}</span><span class="en">${escapeHtml(post.excerptEn)}</span></p>
          <a class="card-link" href="blog/${post.slug}/"><span class="tr">Devamını Oku</span><span class="en">Read More</span></a>
        </article>
      `;
    })
    .join("");

  const fallbackCards = `
    <article class="card">
      <h3 class="card-title"><span class="tr">Henüz içerik yok</span><span class="en">No posts yet</span></h3>
      <p class="card-text"><span class="tr">İlk yazını admin panelinden ekleyebilirsin.</span><span class="en">Add your first post from the admin panel.</span></p>
    </article>
  `;

  const htmlFiles = [
    "index.html",
    "projeler.html",
    "blog.html",
    "hakkimizda.html",
    "cv.html",
    "iletisim.html",
  ];

  for (const file of htmlFiles) {
    const source = await fs.readFile(path.join(root, file), "utf8");
    let output = source;
    if (file === "blog.html") {
      output = output.replace(
        "<!-- BLOG_POSTS -->",
        blogCards.length ? blogCards : fallbackCards
      );
    }
    if (file === "index.html") {
      output = output.replace(
        "<!-- LATEST_POSTS -->",
        latestCards.length ? latestCards : fallbackCards
      );
    }
    await fs.writeFile(path.join(distDir, file), output, "utf8");
  }

  await fs.copyFile(path.join(root, "styles.css"), path.join(distDir, "styles.css"));
  await fs.copyFile(path.join(root, "script.js"), path.join(distDir, "script.js"));
  await copyDir(path.join(root, "assets"), path.join(distDir, "assets"));
  await copyDir(path.join(root, "admin"), path.join(distDir, "admin"));

  for (const post of posts) {
    const outDir = path.join(distDir, "blog", post.slug);
    await ensureDir(outDir);
    const html = renderPost(postTemplate, post);
    await fs.writeFile(path.join(outDir, "index.html"), html, "utf8");
  }
};

build().catch((error) => {
  console.error(error);
  process.exit(1);
});
