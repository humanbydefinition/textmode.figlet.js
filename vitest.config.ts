import path from 'path';

import { defineTextmodeProject } from '@textmode/vitest-config';

export default defineTextmodeProject({
	setupFiles: ['tests/setup/global.setup.ts'],
	projects: [
		{
			test: {
				name: 'unit',
				include: ['tests/unit/**/*.test.ts'],
			},
		},
		{
			test: {
				name: 'integration',
				include: ['tests/integration/**/*.test.ts'],
			},
		},
	],
	alias: {
		'textmode.figlet.js': path.resolve(__dirname, 'src/index.ts'),
	},
});
