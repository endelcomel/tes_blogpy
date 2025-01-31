const fs = require("fs")
const path = require("path")
const fetch = require("node-fetch")

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "")
}

async function generateStaticSite() {
  try {
    const template = fs.readFileSync("template.html", "utf-8")

    // Fetch all articles
    const articlesRes = await fetch("https://blogpy-api.arekilang1.workers.dev/api/articles")
    if (!articlesRes.ok) throw new Error(`Failed to fetch articles: ${articlesRes.statusText}`)
    const articles = await articlesRes.json()

    // Generate index page
    let indexContent = `
            <h1 class="text-3xl font-bold mb-6">Artikel Terbaru</h1>
            <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        `

    for (const article of articles) {
      const slug = slugify(article.judul)
      indexContent += `
                <a href="./article/${article.id}/${slug}.html" class="block bg-white shadow-md rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300">
                    <div class="p-4">
                        <h2 class="text-xl font-semibold mb-2">${article.judul}</h2>
                        <p class="text-gray-600">${new Date(article.tanggal_post).toLocaleDateString("id-ID")}</p>
                    </div>
                </a>
            `

      // Generate article page
      const articleRes = await fetch(`https://blogpy-api.arekilang1.workers.dev/api/articles/${article.id}`)
      if (!articleRes.ok) throw new Error(`Failed to fetch article ${article.id}: ${articleRes.statusText}`)
      const articleData = await articleRes.json()

      const articleContent = `
                <article class="max-w-3xl mx-auto">
                    <h1 class="text-3xl font-bold mb-4">${articleData.judul}</h1>
                    <p class="text-gray-600 mb-4">${new Date(articleData.tanggal_post).toLocaleDateString("id-ID")}</p>
                    <div class="prose max-w-none">${articleData.isi}</div>
                </article>
            `

      const articleHTML = template
        .replace("{{TITLE}}", articleData.judul)
        .replace("{{DESCRIPTION}}", articleData.judul)
        .replace("{{CONTENT}}", articleContent)

      const articleDir = path.join(__dirname, "article", article.id.toString())
      fs.mkdirSync(articleDir, { recursive: true })
      fs.writeFileSync(path.join(articleDir, `${slug}.html`), articleHTML)
    }

    indexContent += "</div>"

    const indexHTML = template
      .replace("{{TITLE}}", "My SEO-Friendly Blog")
      .replace("{{DESCRIPTION}}", "A fast-loading, SEO-friendly blog")
      .replace("{{CONTENT}}", indexContent)

    fs.writeFileSync("index.html", indexHTML)

    console.log("Static site generated successfully!")
  } catch (error) {
    console.error("Error generating static site:", error)
    process.exit(1)
  }
}

generateStaticSite()

