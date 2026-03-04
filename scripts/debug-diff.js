import fs from 'fs';
import path from 'path';
import mammoth from 'mammoth';

async function logDiff(id, docxRelPath) {
  const docxPath = path.join('/Users/pierre/Desktop/Claire&Pierre', docxRelPath);
  const mdPath = `content/letters/${id}.md`;
  
  const { value: text } = await mammoth.extractRawText({ path: docxPath });
  const mdContent = fs.readFileSync(mdPath, 'utf8').split('---').slice(2).join('---').trim();

  fs.writeFileSync(`scripts/${id}-docx.txt`, text);
  fs.writeFileSync(`scripts/${id}-md.txt`, mdContent);
  console.log(`Saved ${id} docx and md representations to scripts/`);
}

logDiff('semaine-00', 'Semaine_00/Danser la poussière_.docx');
logDiff('semaine-01', 'Semaine_01/Accueillir une étrangère_.docx');
logDiff('semaine-12', 'Semaine_12/Baptisé à la source_.docx');
