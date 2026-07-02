import { ReflectionKind } from 'typedoc';

import { createConfig } from '@textmode/tooling-scripts/config';

export default createConfig({
	packageName: 'textmode.figlet.js',
	apiBaseUrl: 'https://code.textmode.art/api/textmode.figlet.js',
	apiDocsDir: 'api/textmode.figlet.js',
	entryPoints: [{ path: 'src/index.ts', namespaceExportsOnly: false, tsconfig: 'tsconfig.json' }],
	checkExampleSketches: true,
	exampleTargetKinds: ReflectionKind.Function | ReflectionKind.Method | ReflectionKind.Accessor,
	exampleTargetKindsWithAccessors: ReflectionKind.Function | ReflectionKind.Method | ReflectionKind.Accessor,
	docstringTargetKinds: ReflectionKind.Function | ReflectionKind.Method | ReflectionKind.Accessor,
	docstringTargetKindsWithAccessors: ReflectionKind.Function | ReflectionKind.Method | ReflectionKind.Accessor,
});
