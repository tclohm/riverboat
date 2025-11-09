import { spawn } from 'child_process';
import { fileURLToPath} from 'url';
import { dirname, resolve } from 'path';

// current dir 
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const seedFile = resolve(__dirname, '../src/lib/db/seed.ts');

const seedProcess = spawn('npx', ['vite-node', seedFile], {
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    MODE: 'development'
  }
});

seedProcess.on('exit', (code) => {
  process.exit(code);
})
