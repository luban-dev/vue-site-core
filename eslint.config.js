// eslint.config.js
import luban from '@luban-ui/eslint-config';

export default luban(
  {
    ignores: ['**/*.scss.d.ts']
  },
  {
    rules: {
      'ts/no-this-alias': 'off'
    }
  }
);
