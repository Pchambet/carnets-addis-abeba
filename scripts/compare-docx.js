const fs = require('fs');
const path = require('path');
const mammoth = require('mammoth');

const SRC_DIR = path.join(process.cwd(), '..');
const MD_DIR = path.join(process.cwd(), 'content', 'letters');

const fileMap = {
  'semaine-00': 'Semaine_00/Danser la poussière_.docx',
  'semaine-01': 'Semaine_01/Accueillir une étrangère_.docx',
  'semaine-02': 'Semaine_02/L’émerveillement du simple_.docx',
  'semaine-03': 'Semaine_03/Sourire à ce qui s’offre_.docx',
  'semaine-04': 'Semaine_04/Choisir de tout aimer_.docx',
  'semaine-05': 'Semaine_05/Apprendre à voir avec le cœur_.docx',
  'semaine-06': 'Semaine_06/Comme un veilleur attend l’aurore_.docx',
  'semaine-07': 'Semaine_07/Rien n’efface la joie_.docx',
  'semaine-08': 'Semaine_08/Nouvelles d’un exil au Kenya_.docx',
  'semaine-09': 'Semaine_09/lettre.docx',
  'semaine-10': 'Semaine_10/La joie fait tout pousser_.docx',
  'semaine-11': 'Semaine_11/Noël au café_.docx',
  'semaine-12': 'Semaine_12/Baptisé à la source_.docx'
};

async function compare() {
  for (const [id, relPath] of Object.entries(fileMap)) {
    const docxPath = path.join(SRC_DIR, relPath);
    const mdPath = path.join(MD_DIR, `${id}.md`);
    
    if (!fs.existsSync(docxPath) || !fs.existsSync(mdPath)) {
      console.log(`Skipping ${id}: Missing file`);
      continue;
    }

    try {
      const { value: text } = await mammoth.extractRawText({ path: docxPath });
      const mdContent = fs.readFileSync(mdPath, 'utf8');
      
      const docxWords = text.replace(/\s+/g, ' ').trim().split(' ').length;
      
      // Strip frontmatter from MD for comparison
      const mdBody = mdContent.split('---').slice(2).join('---');
      const mdWords = mdBody.replace(/\s+/g, ' ').trim().split(' ').length;

      const diff = mdWords - docxWords;
      const diffStr = diff > 0 ? `+${diff}` : diff.toString();
      
      if (Math.abs(diff) > 20) {
        console.log(`⚠️  ${id.padEnd(12)}: DOCX=${docxWords} words | MD=${mdWords} words | Diff: ${diffStr}`);
      } else {
        console.log(`✓  ${id.padEnd(12)}: Matches closely (Diff: ${diffStr})`);
      }
    } catch (e) {
      console.error(`Error processing ${id}:`, e.message);
    }
  }
}

compare();
