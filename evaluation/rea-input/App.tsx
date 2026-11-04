import {format} from './format.js';
type Props = { title: string };
export function App({title}: Props){ return <div>{format(title)}</div>; }
