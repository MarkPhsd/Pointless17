import { Pipe, PipeTransform } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";

@Pipe({name: 'safeHtml'})
export class SafeHtmlPipe implements PipeTransform {
    constructor(private sanitized: DomSanitizer) {
    }
    transform(value: string) {
        return this.sanitized.bypassSecurityTrustHtml(value);
    }
}




// public transform(value: any, type: string): SafeHtml | SafeStyle | SafeScript | SafeUrl | SafeResourceUrl {
//   console.log(type);
//   switch (type) {
//     case 'html': return this.sanitizer.bypassSecurityTrustHtml(value);
//     case 'style': return this.sanitizer.bypassSecurityTrustStyle(value);
//     case 'script': return this.sanitizer.bypassSecurityTrustScript(value);
//     case 'url': return this.sanitizer.bypassSecurityTrustUrl(value);
//     case 'resourceUrl': return this.sanitizer.bypassSecurityTrustResourceUrl(value);
//     default: throw new Error(`Invalid safe type specified: ${type}`);
//   }
// }
