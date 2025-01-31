function slugify(text) {
    return text.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')  // Hapus karakter non-alfanumerik
        .replace(/\s+/g, '-')         // Ganti spasi dengan "-"
        .trim();                      // Hapus spasi di awal dan akhir
}
