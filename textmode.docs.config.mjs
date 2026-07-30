import { defineDocs } from '@textmode/docs';

export default defineDocs({
	checks: {
		docstrings: ['function', 'method', 'accessor'],
		examples: ['function', 'method', 'accessor'],
	},
});
