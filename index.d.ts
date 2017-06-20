export interface Options {
  xmlMode?: boolean;
  collapseWhitespace?: boolean;
  unscopables?: string[];
  injectFirstScript?: boolean;
  toFunction?: boolean;
  transformScripts?: boolean;
  transformStyles?: boolean;
  sourceType?: 'module' | 'embed';
  exportType?: 'es' | 'cjs';
  addSource?: boolean;
  sourceMap?: boolean;
  inputSourceMap?: SourceMap | null;
  startLine?: number;
  startColumn?: number;
  filename?: string;
  indent?: string | number;
  tmplVarName?: string;
  mixinVarName?: string;
  thisVarName?: string;
  keepScope?: boolean;
}

export interface SourceMap {
  version: number;
  sources: string[];
  sourcesContent: Array<string | null>;
  names: string[];
  mappings: string;
  file?: string;
  sourceRoot?: string;
}

export = function (code: string, options?: Options): {
  code: string,
  map: SourceMap | null,
  generatedTmplVar: boolean,
  generatedMixinVar: boolean,
  generatedThisVar: boolean
};
