import {Injectable, Component} from '@angular/core'

@Injectable()
export class CINotifier {
  private static msgMap: { [id: string] : string } = {
    $Unknown: "未知错误",
    AlreadyLoggedIn: "您已登陆",
    CredentialRejected: "凭证错误",
    DocumentLocked: "已锁定",
    DuplicatedEmail: "邮箱已占用",
    InvalidCondition: "非法操作",
    InvalidInput: "非法输入",
    NoSuchConf: "会议不存在",
    NoSuchGroup: "群组不存在",
    NoSuchUser: "用户不存在",
    NotLoggedIn: "请先登录",
    OperationSuccessful: "操作成功",
    PasswdMismatch: "密码不匹配",
    ResetPasswdRequestEmailSent: "我们已将密码重置邮件发往您的邮箱",
    RegisterationEmailSent: "我们已将密码发往您的邮箱",
    ResetSent: "我们已将新密码发往您的邮箱",
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
    if(CINotifier.container.MaterialSnackbar) {
      CINotifier.container.MaterialSnackbar.showSnackbar({
        message: (key in CINotifier.msgMap ? CINotifier.msgMap[key] : key),
        timeout: 2000
      });
    }
  }
}

