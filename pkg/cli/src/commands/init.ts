import { writeFile } from 'node:fs/promises';
import { generateConfigTemplate } from '@stitchguard/config';

const CONFIG_FILENAME = 'stitchguard.config.ts';

export async function runInit(force = false): Promise<void> {
  const { access } = await import('node:fs/promises');

  try {
    await access(CONFIG_FILENAME);
    if (!force) {
      console.log(`${CONFIG_FILENAME} already exists. Use --force to overwrite.`);
      return;
    }
  } catch {
    // file does not exist
  }

  await writeFile(CONFIG_FILENAME, generateConfigTemplate());
  console.log(`Created ${CONFIG_FILENAME}`);
}
