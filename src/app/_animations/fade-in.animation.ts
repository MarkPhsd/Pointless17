// import the required animation functions from the angular animations module
import { trigger, animate, transition, style, group, query, animateChild } from '@angular/animations';

export const fadeInAnimation =
    // trigger name for attaching this animation to an element using the [@triggerName] syntax
    trigger('fadeInAnimation', [
        transition('* => *', [
          group([
            query(':enter', style({ opacity: 0 })),
            query(':leave', [
              animate('500ms', style({ opacity: 0 })),
              style({ display: 'none' }),
              animateChild()
            ], { optional: true }),
            query(':enter', [
              animate('600ms',
              style({ opacity: 1 })),
              animateChild()
            ], { optional: true })
          ])
        ]),
    ]);

export const fadeAnimation =

trigger('fade', [
  transition('void => *', [
    style({opacity: 0}),
    animate(150, style({opacity: 1}))
  ]),
  transition('* => void', [
    animate(0, style({opacity: 0}))
  ])
])

    // route 'enter' transition
    //transition(':enter', [
    //    // css styles at start of transition
    //    style({ opacity: 0 }),
    //    // animation and styles at end of transition
    //    animate('.3s', style({ opacity: 1 }))
    //]),
