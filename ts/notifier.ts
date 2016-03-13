import {Injectable, Component} from 'angular2/core'

@Injectable()
export class CINotifier {
  private static msgMap: { [id: string] : string } = {
    CredentialRejected: "凭证错误",
    DuplicatedEmail: "邮箱已占用",
    RegisterationEmailSent: "我们已将密码发往您的邮箱",
    NotLoggedIn: "请先登录",
    OperationSuccessful: "操作成功",
    InvalidCondition: "非法操作",
    InvalidInput: "非法输入",
    AlreadyLoggedIn: "您已登陆",
    PasswdMismatch: "密码不匹配",
    $Unknown: "未知错误"
  }

  private static container :any;

  constructor() {
    this.setContainer(document.getElementById("ci-snackbar"));
  }

  setContainer(container: any) {
    CINotifier.container = container;
  }

  register(key: string, value: string) {
    CINotifier.msgMap[key]=value;
  }

  show(key: string) {
    if(!(key in CINotifier.msgMap)) key = "$Unknown";
    if(CINotifier.container.MaterialSnackbar) {
      CINotifier.container.MaterialSnackbar.showSnackbar({
        message: CINotifier.msgMap[key],
        timeout: 2000
      });
    }
  }
}

