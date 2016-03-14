import {HTTP_PROVIDERS, Http, Response, Headers, RequestOptions} from 'angular2/http'
import {Injectable} from 'angular2/core'

import * as Config from './config'

@Injectable()
export class CIConfService {

  private static urlBase = 'http://' + Config.backend.host + ':' + Config.backend.port + '/conf/';
  private static reqOpt = new RequestOptions({
    headers: new Headers({
      'Content-Type': 'application/json'
    })
  });

  getConfList() {
  }

  getConfData(id: Number) {
  }

  /* Settings */
  updateMember(id: Number, role: Number) {
  }

  deleteMember(id: Number) {
  }

  /* Forms */
  updateForm() {
  }

  getForm() {
  }

  postForm() {
  }

  getFormResults() {
  }
}
