/*
 * WARNING:
 * All contents in this file is intended to fix or polyfill libraries which is in beta (Angular2 etc.)
 * Please think carefully for a workaround before adding new methods & classes into this file
 */

// From https://github.com/angular/http/issues/65
import {BrowserXhr} from "@angular/http";
import {Injectable} from "@angular/core";

@Injectable()
export class CORSBrowserXHR extends BrowserXhr {
  // TODO: fixed in the next angular release
  build(): any {
    console.log("ConsoleiT Warning: Patching Xhr request");
    let xhr: any = super.build();
    xhr.withCredentials = true;
    return xhr;
  }
}
