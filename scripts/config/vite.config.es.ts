import path from 'node:path';
import { createRequire } from 'node:module';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import { createClassNamehash } from '../utils/createClassNameHash';
import { injectCssModulePlugin } from '../utils/injectCssModulePlugin';
import { makeExternalPredicate } from '../utils/makeExternalPredicate';

const root = path.resolve(__dirname, '../../');
const require = createRequire(import.meta.url);
const resolve = (p: string) => path.resolve(root, p);
const pkg = require(resolve(`package.json`));

// https://vitejs.dev/config/
export default defineConfig({
  root,
  resolve: {
    alias: {
      '@': path.resolve(root, './src/')
    }
  },
  plugins: [vue(), vueJsx(), injectCssModulePlugin()],
  build: {
    outDir: 'dist/es',
    minify: false,
    lib: {
      entry: path.resolve(root, 'src/index.ts'),
      fileName: () => {
        return `index.js`;
      },
      formats: ['es']
    },
    rollupOptions: {
      // 确保外部化处理那些你不想打包进库的依赖
      external: makeExternalPredicate([
        ...Object.keys(pkg.dependencies || {}),
        ...Object.keys(pkg.peerDependencies || {})
      ]),
      output: {
        preserveModules: true,
        exports: 'named',
        entryFileNames: () => {
          return `[name].js`;
        }
      }
    }
  },
  css: {
    modules: {
      generateScopedName(name, filename, css) {
        return createClassNamehash({
          root,
          name,
          filename,
          css,
          prefix: 'lb-'
        });
      }
    }
  }
});
