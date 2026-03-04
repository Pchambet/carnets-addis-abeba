import fs from 'fs';
import path from 'path';
import mammoth from 'mammoth';

const SRC_DIR = '/Users/pierre/Desktop/Claire&Pierre';
const MD_DIR = 'content/letters';

async function sync(id, docxRelPath) {
  const docxPath = path.join(SRC_DIR, docxRelPath);
  const mdPath = path.join(MD_DIR, `${id}.md`);
  
  if (!fs.existsSync(docxPath) || !fs.existsSync(mdPath)) return;

  const { value: text } = await mammoth.extractRawText({ path: docxPath });
  const mdContent = fs.readFileSync(mdPath, 'utf8');
  
  // Extract existing frontmatter
  const parts = mdContent.split('---');
  if (parts.length < 3) return;
  
  const frontmatter = parts[1];
  
  // Format the mammoth text slightly to preserve paragraphs
  // Mammoth often returns double newlines for paragraphs which is what we want,
  // but let's ensure it's clean markdown
  const cleanText = text
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  // Create new content with original frontmatter + exact docx text
  const newContent = `---\n${frontmatter}\n---\n\n${cleanText}\n`;
  
  fs.writeFileSync(mdPath, newContent);
  console.log(`✓ Restored strict fidelity for ${id}`);
}

async function run() {
  await sync('semaine-00', 'Semaine_00/Danser la poussière_.docx');
  await sync('semaine-01', 'Semaine_01/Accueillir une étrangère_.docx');
  await sync('semaine-12', 'Semaine_12/Baptisé à la source_.docx');
}

run();
