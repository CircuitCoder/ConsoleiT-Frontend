import {bootstrap} from 'angular2/platform/browser'
import {provide} from 'angular2/core'
import {BrowserXhr, HTTP_PROVIDERS} from 'angular2/http'

import {CIFrame} from './frame'
import {CORSBrowserXHR} from './monkeypatch'
import * as config from './config'

export function start() {
  console.log(config);
  bootstrap(CIFrame, [
    HTTP_PROVIDERS,
    provide(BrowserXhr, { useClass: CORSBrowserXHR })
  ]);
}
