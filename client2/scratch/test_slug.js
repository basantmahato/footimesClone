function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

console.log("Original: ISL 2026: Mohun Bagan vs Chennaiyin FC");
console.log("Slugified:", slugify("ISL 2026: Mohun Bagan vs Chennaiyin FC"));
