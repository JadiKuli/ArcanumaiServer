/* eslint-disable */
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';

export async function downloadFile(
  url: string,
  outputPath: string,
): Promise<string> {
  if (!url) return '';

  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const writer = fs.createWriteStream(outputPath);
  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream',
  });

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', () => {
      console.log(`✅ File saved: ${outputPath}`);
      resolve(outputPath);
    });
    writer.on('error', reject);
  });
}
