import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConsoleService {

  constructor() { }
  //https://stackoverflow.com/questions/13815640/a-proper-wrapper-for-console-log-with-correct-line-number
  console(message: any) {
    console.log(message)
  }
}
