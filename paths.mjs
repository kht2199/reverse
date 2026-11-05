import fs from 'node:fs';
import path from 'node:path';
export function safeOutput(root,requested,{mustBeNew=false}={}) {
  root=fs.realpathSync(root);requested=path.resolve(requested);
  let existing;
  try{existing=fs.lstatSync(requested);}catch(e){if(e.code!=='ENOENT')throw e;}
  if(existing?.isSymbolicLink()||existing?.isDirectory())throw Error('Output must be a regular file outside target root, not a symlink or directory');
  if(mustBeNew&&existing)throw Error('Output must be new');
  let ancestor=path.dirname(requested);
  while(!fs.existsSync(ancestor)){const parent=path.dirname(ancestor);if(parent===ancestor)throw Error('No output parent');ancestor=parent;}
  const canonical=fs.realpathSync(ancestor),target=fs.statSync(root);
  // realpath on case-insensitive filesystems can preserve caller casing. Compare identities.
  for(let p=canonical;;p=path.dirname(p)){
    const st=fs.statSync(p);
    if(st.dev===target.dev&&st.ino===target.ino)throw Error('Output must be outside the analyzed root (including case/symlink aliases)');
    if(path.dirname(p)===p)break;
  }
  return path.resolve(canonical,path.relative(ancestor,requested));
}
