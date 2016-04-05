// Utitlities

declare var md5: any;
declare var marked: any;
declare var saveAs: any;

/**
 * Generate gravatar url from email
 */
export function generateGravatar(email: string) {
  return `https://gravatar.lug.ustc.edu.cn/avatar/${md5(email)}?d=mm&r=g`;
}

/**
 * Custom markdown rendering
 */
export function cardMarked(text: string, cb: (titles: string[], bodies: string[]) => void) {
  if(!text) return cb([], ['']);

  var renderer = new marked.Renderer();
  renderer.heading = function(text: string, level: number) {
    if(level == 1)
      return `#${text}\n`;
    else
      return `<h${level}>${text}</h${level}>`;
  };

  renderer.paragraph = function(text: string) {
    return `<div class="mdl-card__supporting-text">${text}</div>`
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

/**
 * Export form to pure text file
 */
export function exportForm(formFields: any[], name: string) {
  return formFields.reduce((prev: string, e: any, fi: number): string => {
    if(e.type == "title") return prev + '# ' + e.title + "\n\n";
    else {
      prev += '# ' + e.title + (e.required ? '*' : '') + "\n";
      if(e.desc != null) prev += "#\n# " + e.desc + "\n";

      if(e.type == "input" || e.type == "area") return prev + `\n[您的回答:]\n---\n\n`;
      else if(e.type == "radio" || e.type == "checkbox") {
        prev += (e.type == "radio" ? "# 单选:\n" : "# 复选:\n");
        prev += e.choices.map((e: string, i: number) => `# ${i+1} ${e}`).join("\n");
        return prev + `\n\n[您的回答(数字，逗号分隔):]\n---\n\n`;
      } else {
        console.log("WTF", e);
      }
    }
  },
`#
# ${name}
# 注意: 请勿在回答中使用中括号和井号
#\n\n`
  );
}

/**
 * Import a user-filled form, based on its template
 */
export function parseForm(formFields: any[], formStr: string) {
  var result: any[] = [];
  var counter = 0;
  formStr.replace(/#.*[\r\n]/g, '').replace(/\[.*:\]/g, '').replace(/^\s*[\r\n]/gm, '').split(/---[\r\n]/).forEach((e, i) => {
    while(counter < formFields.length && formFields[counter].type == "title") ++counter;
    if(counter == formFields.length) return; // After last seperator
    if(formFields[counter].type == "input") {
      result[counter] = e.replace(/[\n\r]/g, ' ');
    } else if(formFields[counter].type == "area") {
      result[counter] = e;
    } else if(formFields[counter].type == "checkbox") {
      result[counter] = {};
      e.split(',').forEach(i => {
        result[counter][formFields[counter].choices[parseInt(i)-1]] = true;
      });
    } else if(formFields[counter].type == "radio") {
      result[counter] = formFields[counter].choices[parseInt(e)-1];
    }
    ++counter;
  });

  return result;
}

/**
 * Helper: Save a file
 */
export function saveFile(name: string, texts: string[]) {
  saveAs(new Blob(texts, { type: "text/plain;charset=utf-8" }), name);
}
