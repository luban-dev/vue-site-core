import path from 'node:path';
import type { Plugin } from 'vite';

export const injectCssModulePlugin: () => Plugin = () => {
  const cssModuleRe
    = /\.module\.(css|less|sass|scss|styl|stylus|pcss|postcss)($|\\?.*$)/;
  const isCSSModuleRequest = (request: string): boolean =>
    cssModuleRe.test(request);
  const styles: Record<string, string> = {};

  return {
    name: 'luban:inject-css-module',
    async transform(code, id) {
      if (!isCSSModuleRequest(id) || !code) {
        return null;
      }
      styles[id] = code;
      return null;
    },
    renderChunk(code, chunk) {
      const facadeModuleId = chunk.facadeModuleId || '';
      if (!isCSSModuleRequest(facadeModuleId) || !code) {
        return null;
      }
      const style = styles[facadeModuleId];
      if (!style)
        return null;
      const filename = chunk.fileName.replace(/\.module\.scss\.js/, '.css');
      const name = path.basename(filename);

      this.emitFile({
        fileName: filename,
        type: 'asset',
        source: style
      });
      return {
        code: `import './${name}';\r\n${code}`,
        map: { mappings: '' },
        moduleSideEffects: 'no-treeshake'
      };
    }
  };
};
