import {bootstrap} from "@angular/platform-browser-dynamic";
import {BrowserXhr, HTTP_PROVIDERS} from "@angular/http";
import {ROUTER_PROVIDERS} from "@angular/router-deprecated";

import {CIFrame} from "./frame";
import * as config from "./config";

export function start() {
  console.log(config);
  bootstrap(CIFrame, [
    ROUTER_PROVIDERS,
    HTTP_PROVIDERS,
    BrowserXhr,
  ]);
}

document.addEventListener("DOMContentLoaded", start);
