import { Component, OnInit } from '@angular/core';
// import { Registry } from 'winreg-ts'

@Component({
  selector: 'app-scale-reader',
  templateUrl: './scale-reader.component.html',
  styleUrls: ['./scale-reader.component.scss']
})
export class ScaleReaderComponent{
  regKey: any;

  constructor() {
    this.readReg();
  }

  readReg() {

  }

}
