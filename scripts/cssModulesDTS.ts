import path from 'node:path';
import process from 'node:process';
import watch from 'node-watch';
import * as sass from 'sass';
import { glob } from 'glob';
import { minimatch } from 'minimatch';
import DtsCreator from 'typed-css-modules';

const RealDtsCreator = (DtsCreator as any).default;
const root = process.cwd();
const creator = new RealDtsCreator({
  rootDir: root,
  namedExports: true,
  camelCase: 'none'
});

const updateFile = async (f: string) => {
  try {
    const out = await sass.compileAsync(f, {
      importers: [
        {
          findFileUrl(url) {
            if (!url.startsWith('@'))
              return null;
            const p = path.resolve(__dirname, '../src/', url.substring(2));
            const res = new URL(`file://${p}`);
            return res;
          }
        }
      ]
    });
    const content = await creator.create(f, out.css, true);
    return await content.writeFile(() => content.formatted || '');
  } catch (e) {
    console.error(e);
  }
};

watch(
  root,
  {
    recursive: true,
    filter: f => minimatch(f, '**/*.module.scss')
  },
  (evt, name) => {
    if (evt === 'update') {
      updateFile(name);
    }
  }
);

glob('**/*.module.scss', {
  cwd: root
}).then((files) => {
  files.forEach((f) => {
    updateFile(path.resolve(root, f));
  });
});
