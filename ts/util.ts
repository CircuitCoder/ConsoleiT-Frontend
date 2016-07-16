// Utitlities

export interface MDLHandler {
  upgradeElements(el: any): void;
  upgradeDom(): void;
  downgradeElements(el: any): void;
}

declare const md5: any;
declare const saveAs: any;
declare const componentHandler: MDLHandler;

/**
 * Generate gravatar url from email
 */
export function generateGravatar(email: string) {
  return `https://gravatar.lug.ustc.edu.cn/avatar/${md5(email)}?d=404&r=g`;
}

const md = require('markdown-it');
const mdc = md({
  linkify: true,
  typographer: false,
  html: false,
  breaks: true,
});

mdc.renderer.rules.paragraph_open = (tokens: any[], idx: number, options: any, env: any, self: any) => {
  const token = tokens[idx];
  if(token.level === 0) return '<div class="mdl-card__supporting-text">';
  else return self.renderToken(tokens, idx, options);
}

mdc.renderer.rules.paragraph_close = (tokens: any, idx: any, options: any, env: any, self: any) => {
  const token = tokens[idx];
  if(token.level === 0) return '</div>';
  else return self.renderToken(tokens, idx, options);
}

/**
 * Custom markdown rendering
 */
export function cardMarked(text: string, cb: (titles: string[], bodies: string[]) => void) {
  if(!text) return cb([], [""]);

  const compiled = mdc.render(text);
  console.log(compiled);
  const bodies = compiled.split(/<h1>.*<\/h1>\n/);
  const titles: string[] = [];
  const titleMatcher = /<h1>(.*)<\/h1>\n/g;
  let match = titleMatcher.exec(compiled);

  while(match) {
    titles.push(match[1]);
    match = titleMatcher.exec(compiled);
  }

  cb(titles, bodies);
}

/**
 * Export form to pure text file
 */
export function exportForm(formFields: any[], formData: any[], name: string) {
  return formFields.reduce((prev: string, e: any, fi: number): string => {
    if(e.type === "title") return prev + "# " + e.title + "\n\n";
    else {
      prev += "# " + e.title + (e.required ? "*" : "") + "\n";
      if(e.desc !== null) prev += "#\n# " + e.desc + "\n";

      if(e.type === "input" || e.type === "area") return prev + `\n[您的回答:]${formData[fi] ? formData[fi] : ""}\n---\n\n`;
      else if(e.type === "radio" || e.type === "checkbox") {
        let selected: string;
        if(formData[fi] !== null || formData[fi] !== undefined) {
          if(e.type === "radio") selected = (formData[fi] + 1).toString();
          else {
            let selectedKeys: number[] = [];
            Object.keys(formData[fi]).forEach(key => {
              if(formData[fi][key]) selectedKeys.push(parseInt(key) + 1);
            });
            selected = selectedKeys.sort().map(k => k.toString()).join(",");
          }
        } else selected = "";

        prev += (e.type === "radio" ? "# 单选:\n" : "# 复选:\n");
        prev += e.choices.map((e: string, i: number) => `# ${i + 1} ${e}`).join("\n");
        return prev + `\n\n[您的回答(数字，逗号分隔):]${selected}\n---\n\n`;
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
  let result: any[] = [];
  let counter = 0;
  formStr.replace(/#.*[\r\n]/g, "").replace(/\[.*:\]/g, "").replace(/^\s*[\r\n]/gm, "").split(/---[\r\n]/).forEach((e, i) => {
    while(counter < formFields.length && formFields[counter].type === "title") ++counter;
    if(counter === formFields.length) return; // After last seperator
    if(formFields[counter].type === "input") {
      result[counter] = e.replace(/[\n\r]/g, " ");
    } else if(formFields[counter].type === "area") {
      result[counter] = e;
    } else if(formFields[counter].type === "checkbox") {
      result[counter] = {};
      e.split(",").forEach(i => {
        result[counter][parseInt(i) - 1] = true;
      });
    } else if(formFields[counter].type === "radio") {
      result[counter] = parseInt(e) - 1;
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

/**
 * Upgrade MDL components
 */
export function upgradeMDL(elem?: any) {
  if(elem) componentHandler.upgradeElements(elem);
  else componentHandler.upgradeDom();
}

/**
 * Downgrade MDL components
 */
export function downgradeMDL(elem: any) {
  componentHandler.downgradeElements(elem);
}

/**
 * Reinitialize getmdl-select
 * Require a MDL upgrade afterwards
 */
export function updateGetmdlSelects(cb: (iter: number) => void, item: HTMLElement) {
  let items = item.querySelectorAll("li");
  [].forEach.call(items, (i: any, index: number) => {
    i.addEventListener("click", () => cb(index));
  });
}

/**
 * Deep clone a object or a array.
 * GUYS why there is still not a deep clone function in standard js?
 */
export function deepClone(elem: any) {
  if(elem === null) return null;
  else if(typeof elem !== "object") return elem;
  else if(Array.isArray(elem)) {
    let result: any[] = [];
    elem.forEach((e: any) => result.push(deepClone(e)));
    return result;
  } else {
    let result: any = {};
    Object.keys(elem).forEach((k: string) => result[k] = deepClone(elem[k]));
    return result;
  }
}

/* tslint:disable */

var lut: string[] = [];
for (var i=0; i<256; i++) { lut[i] = (i<16?'0':'')+(i).toString(16); }

/**
 * Fast UUID generator, RFC4122 version 4 compliant.
 * @author Jeff Ward (jcward.com).
 * @license MIT license
 * @link http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript/21963136#21963136
 */
export function generateUUID() {
  var d0 = Math.random()*0xffffffff|0;
  var d1 = Math.random()*0xffffffff|0;
  var d2 = Math.random()*0xffffffff|0;
  var d3 = Math.random()*0xffffffff|0;
  return lut[d0&0xff]+lut[d0>>8&0xff]+lut[d0>>16&0xff]+lut[d0>>24&0xff]+'-'+
    lut[d1&0xff]+lut[d1>>8&0xff]+'-'+lut[d1>>16&0x0f|0x40]+lut[d1>>24&0xff]+'-'+
    lut[d2&0x3f|0x80]+lut[d2>>8&0xff]+'-'+lut[d2>>16&0xff]+lut[d2>>24&0xff]+
    lut[d3&0xff]+lut[d3>>8&0xff]+lut[d3>>16&0xff]+lut[d3>>24&0xff];
};

/* tslint:enable */
