import {Pipe, PipeTransform} from '@angular/core'

@Pipe({
  name: 'funcFilter',
})
export class CIFuncFilter implements PipeTransform {
  transform(values: any[], args: any) : any {
    return values.filter(e => args[0].apply(null, [e].concat(args.slice(1))));
  }
}
