import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'asUrl',
})
export class BackgroundUrlPipe implements PipeTransform {
  getAwsBucket() {
    return '';
  }

  transform(value: string): string {
    const url = localStorage.getItem('awsBucket')
    return `url(${url}${value})`;
  }
}
