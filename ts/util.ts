// Utitlities

declare var md5: any;

/**
 * Generate gravatar url from email
 */
export function generateGravatar(email: string) {
  return "https://gravatar.lug.ustc.edu.cn/avatar/" + md5(email) + "?d=mm&r=g";
}
