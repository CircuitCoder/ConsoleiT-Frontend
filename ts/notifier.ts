import {Injectable, Component} from 'angular2/core'

@Injectable()
export class CINotifier {
  private static errorMap : { [id: string] : string } = {
    CredentialRejected: "凭证错误",
    DuplicatedEmail: "邮箱已占用",
  }

  register(key: string, value: string) {
    CINotifier.errorMap[key]=value;
  }

  show(key: string) {
    console.log(CINotifier.errorMap[key]);
  }
}

