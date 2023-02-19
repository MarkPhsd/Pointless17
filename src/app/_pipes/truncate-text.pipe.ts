import { Pipe, PipeTransform } from '@angular/core';
@Pipe({
  name: 'truncateText'
})
export class TruncateTextPipe implements PipeTransform {

  transform(value: string, length: number): string {
    const biggestWord = 50;
    const elipses = "...";

    if(typeof value === "undefined") return value;
    if(value === null) return value;

    if(value.length <= length) return value;

    //.. truncate to about correct lenght

    let truncatedText = value.slice(0, length + biggestWord);

    while (truncatedText.length > length - elipses.length) {
        let lastSpace = truncatedText.lastIndexOf(" ");
        if(lastSpace === -1) break;
        truncatedText = truncatedText.slice(0, lastSpace).replace(/[!,.?;:]$/, '');
    };

   return truncatedText + elipses;

  }
}

// /*

// A pipe is a class decorated with pipe metadata.
// The pipe class implements the PipeTransform interface's transform method that accepts an input value followed by optional parameters and returns the transformed value.
// There will be one additional argument to the transform method for each parameter passed to the pipe. Your pipe has one such parameter: the exponent.
// To tell Angular that this is a pipe, you apply the @Pipe decorator, which you import from the core Angular library.
// The @Pipe decorator allows you to define the pipe name that you'll use within template expressions. It must be a valid JavaScript identifier.

// */
// /*
//   This pipe truncates a string.
//   Use it like so {{ String expression | truncate:10 }}
//   This truncates the string to 10 letters and adds '...' to end.
// */

// @Pipe({ name: 'truncate' })
// export class TruncatePipe implements PipeTransform {

//   /*
//   The transform method is essential to a pipe. The PipeTransform interface defines that method and guides both tooling and the compiler. Technically, it's optional; Angular looks for and executes the transform method regardless.
//   */

//   transform(value: string, limit: number): string {
//     return value.length < limit
//       ? value
//       : value.slice(0, limit) + '...';
//   }
// }
