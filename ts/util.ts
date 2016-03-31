// Utitlities

declare var md5: any;
declare var marked: any;

/**
 * Generate gravatar url from email
 */
export function generateGravatar(email: string) {
  return "https://gravatar.lug.ustc.edu.cn/avatar/" + md5(email) + "?d=mm&r=g";
}

/**
 * Custom markdown rendering
 */
export function cardMarked(text: string, cb: (titles: string[], bodies: string[]) => void) {
  if(!text) return cb([], ['']);

  var renderer = new marked.Renderer();
  renderer.heading = function(text: string, level: number) {
    if(level == 1)
      return '#' + text + "\n";
    else
      return '<h' + level + '>' + text + '</h' + level + '>';
  };

  renderer.paragraph = function(text: string) {
    return '<div class="mdl-card__supporting-text">' + text + '</div>'
  }

  //TODO: tables
  
  let compiled = marked(text, {
    renderer: renderer,
    breaks: true,
    sanitize: true
  });

  let bodies = compiled.split(/#.*\n/);
  let titles = compiled.match(/#(.*)\n/g).map((str:string) => str.substring(1));
  console.log(bodies);
  console.log(titles);
  cb(titles, bodies);
}
