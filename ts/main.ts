import {bootstrap} from 'angular2/platform/browser'
import {CIFrame} from './frame'
import * as config from './config'

export function start() {
  console.log(config);
  bootstrap(CIFrame);
}
