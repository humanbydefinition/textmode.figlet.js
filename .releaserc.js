import { createReleaseConfig } from '@textmode/release-config';

export default createReleaseConfig({
	githubAssets: ['dist/textmode.figlet.esm.js', 'dist/textmode.figlet.umd.js'],
});
