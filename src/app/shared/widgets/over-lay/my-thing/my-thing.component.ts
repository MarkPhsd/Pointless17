import { Component, OnInit ,EventEmitter, Output} from '@angular/core';
import { trigger,state,style,animateChild,transition,animate,keyframes,query,stagger } from '@angular/animations';

@Component({
  selector: 'my-thing',
  templateUrl: './my-thing.component.html',
  styleUrls: ['./my-thing.component.scss'],
  animations: [

    trigger('slide', [
      transition(':enter', [
        style({opacity: 0}),
          animate('100ms ease',
            style({opacity: 1})
        ),
        query("@*", [animateChild()], {optional: true})
      ]),
      transition(':leave', [
        query("@*", [animateChild()], {optional: false}),
      ]),
    ]),

    trigger('childAnimation', [
      transition(':enter', [
          style({transform: 'translateX(100%)'}),
          animate('800ms cubic-bezier(0.2, 1, 0.3, 1)',
            style({transform: 'translateX(0%)'})
          )
      ]),
      transition(':leave', [
          style({transform: 'translateX(0%)'}),
          animate('300ms ease',
            style({
              transform: 'translateX(100%)',
              boxShadow: '0px 0 00px 0px rgba(87,73,86,0.0)'}
              )
          )
      ])
    ])

  ]
})
export class MyThingComponent {
  @Output() dismiss = new EventEmitter<any>();

  constructor() { }

  dismissEmit() {
    this.dismiss.emit();
  }
}
