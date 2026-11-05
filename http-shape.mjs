import ts from 'typescript';
// Transport positions, not arbitrary object literals: axios.post(url,data,config), etc.
export function httpShape(call,sf){
  const callee=call.expression.getText(sf),args=call.arguments;
  const match=/^axios\.(get|post|put|patch|delete|head|options)$/.exec(callee);
  const object=n=>n&&ts.isObjectLiteralExpression(n)?n:undefined;
  const properties=n=>new Map(object(n)?.properties.filter(ts.isPropertyAssignment).map(p=>[p.name.getText(sf).replace(/['"]/g,''),p.initializer])??[]);
  let config,url,method,defaultMethod='UNKNOWN',mode;
  if(match){const verb=match[1].toUpperCase();mode='axios-method';url=args[0];defaultMethod=verb;config=args[['POST','PUT','PATCH'].includes(verb)?2:1];}
  else if(callee==='fetch'){mode='fetch';url=args[0];config=args[1];defaultMethod=config&&!object(config)?'UNKNOWN':'GET';method=properties(config).get('method');}
  else if(callee==='axios'||callee==='axios.request'){
    mode='axios-config';config=object(args[0])?args[0]:args[1];const props=properties(config);url=object(args[0])?props.get('url'):args[0];method=props.get('method');
  }else{config=object(args[0]);const props=properties(config);if(!props.has('method')||!props.has('url'))return null;mode='config-call-candidate';url=props.get('url');method=props.get('method');}
  return {mode,url,method,defaultMethod,config:object(config),configUnknown:!!config&&!object(config),configSpread:!!object(config)?.properties.some(ts.isSpreadAssignment)};
}
export function literalHttpMethod(shape){const value=shape.method;return value&&(ts.isStringLiteral(value)||ts.isNoSubstitutionTemplateLiteral(value))?value.text.toUpperCase():value?'UNKNOWN':shape.defaultMethod;}
