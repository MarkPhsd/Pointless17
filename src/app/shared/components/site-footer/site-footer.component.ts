import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-site-footer',
  templateUrl: './site-footer.component.html',
  styleUrls: ['./site-footer.component.scss']
})
export class SiteFooterComponent implements OnInit {
  matToolbarColor = 'primary';
  mattoolbar      = 'mat-toolbar';

  constructor() { }

  ngOnInit(): void {
    const i = 0;
  }

}
