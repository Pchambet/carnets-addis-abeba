import fs from 'fs';
import path from 'path';

const MD_DIR = 'content/letters';

const pqs = {
  'semaine-00': "Je danse avec la poussière. Elle se glisse dans les yeux, dans la bouche, dans l’espoir. La poussière d’Addis est familière.",
  'semaine-01': "J’étais une étrangère et c’est en cela que je devais être respectée.",
  'semaine-12': "L’homme qui n’aime pas ne vit pas."
};

for (const [id, pq] of Object.entries(pqs)) {
  const mdPath = path.join(MD_DIR, `${id}.md`);
  if (!fs.existsSync(mdPath)) continue;
  
  let mdContent = fs.readFileSync(mdPath, 'utf8');
  
  // Insert "> PQ: ..." right after the frontmatter
  const parts = mdContent.split('---');
  if (parts.length < 3) continue;
  
  const frontmatter = parts[1];
  const body = parts.slice(2).join('---').trim();
  
  // Clean up some mammoth artifacts like empty bold "** **" or weird spacing
  let cleanBody = body
    .replace(/\*\*\s*\*\*/g, '')
    .replace(/\n{3,}/g, '\n\n')
    // Ensure "Dimanche", "Lundi" etc are proper headers if they appear at the start of a paragraph
    .replace(/\n(Lundi|Mardi|Mercredi|Jeudi|Vendredi|Samedi|Dimanche)(\s*.*)?\n/g, '\n**$1$2**\n');
  
  const newContent = `---\n${frontmatter}\n---\n\n> PQ: ${pq}\n\n${cleanBody}\n`;
  fs.writeFileSync(mdPath, newContent);
  console.log(`✓ Restored pull quote & cleaned for ${id}`);
}
