import ts from 'typescript';
// Binding identity is the declaration record, never just its spelling.
export function bindingModel(sf) {
  const scopes = new Map(), records = [];
  const names = node => ts.isIdentifier(node) ? [node.text]
    : node?.elements?.flatMap(e => ts.isOmittedExpression(e) ? [] : names(e.name)) ?? [];
  const outerScope = (node, functionOnly = false) => {
    for (let p = node.parent; p; p = p.parent) {
      if (ts.isSourceFile(p) || ts.isFunctionLike(p)) return p;
      if (!functionOnly && (ts.isBlock(p) || ts.isCaseBlock(p) || ts.isCatchClause(p)
        || ts.isForStatement(p) || ts.isForOfStatement(p) || ts.isForInStatement(p))) return p;
    }
    return sf;
  };
  const add = (name, declaration, scope, kind, extra = {}) => {
    const b = {name, declaration, scope, kind, plain: ts.isIdentifier(declaration.name ?? {}), ...extra};
    if (!scopes.has(scope)) scopes.set(scope, new Map());
    const map = scopes.get(scope);
    if (!map.has(name)) map.set(name, []);
    map.get(name).push(b); records.push(b);
  };
  const exported = n => !!(n.modifiers ?? n.parent?.parent?.modifiers)?.some(m => m.kind === ts.SyntaxKind.ExportKeyword);
  function visit(n) {
    if (ts.isVariableDeclaration(n)) {
      const caught = ts.isCatchClause(n.parent), list = n.parent;
      const isConst = !caught && !!(list.flags & ts.NodeFlags.Const);
      const scope = caught ? n.parent : outerScope(n, !(list.flags & ts.NodeFlags.BlockScoped));
      for (const name of names(n.name)) add(name, n, scope, caught ? 'catch' : 'variable', {isConst, initializer:n.initializer, exported:exported(n)});
    } else if (ts.isParameter(n)) {
      for (const name of names(n.name)) add(name, n, n.parent, 'parameter');
    } else if (ts.isFunctionDeclaration(n) && n.name) {
      add(n.name.text, n, outerScope(n), 'function', {exported:exported(n)});
    } else if (ts.isFunctionExpression(n) && n.name) {
      add(n.name.text, n, n, 'function');
    } else if (ts.isImportDeclaration(n)) {
      const clause = n.importClause;
      if (clause?.name) add(clause.name.text, clause, sf, 'import', {specifier:n.moduleSpecifier.text, importedName:'default'});
      for (const spec of clause?.namedBindings?.elements ?? []) add(spec.name.text, spec, sf, 'import', {specifier:n.moduleSpecifier.text, importedName:spec.propertyName?.text ?? spec.name.text});
      if (clause?.namedBindings && ts.isNamespaceImport(clause.namedBindings)) add(clause.namedBindings.name.text, clause.namedBindings, sf, 'namespace-import');
    } else if (ts.isClassDeclaration(n) && n.name) {
      add(n.name.text,n,outerScope(n),'class');
    }
    ts.forEachChild(n, visit);
  }
  visit(sf);
  const lookup = (name, use) => {
    for (let p=use;p;p=p.parent) {
      const found = scopes.get(p)?.get(name);
      if (found) return found;
    }
    return [];
  };
  function mutation(n) {
    let left;
    if (ts.isBinaryExpression(n) && n.operatorToken.kind >= ts.SyntaxKind.FirstAssignment && n.operatorToken.kind <= ts.SyntaxKind.LastAssignment) left=n.left;
    if ((ts.isPrefixUnaryExpression(n)||ts.isPostfixUnaryExpression(n)) && [ts.SyntaxKind.PlusPlusToken,ts.SyntaxKind.MinusMinusToken].includes(n.operator)) left=n.operand;
    while (left && (ts.isPropertyAccessExpression(left)||ts.isElementAccessExpression(left))) left=left.expression;
    if (left && ts.isIdentifier(left)) for(const b of lookup(left.text,left)) b.mutated=true;
    ts.forEachChild(n,mutation);
  }
  mutation(sf);
  const exports = new Map();
  for (const b of records) if(b.scope===sf && b.exported) {
    if(!exports.has(b.name)) exports.set(b.name,[]);
    exports.get(b.name).push(b);
  }
  return {records,lookup,exports};
}
