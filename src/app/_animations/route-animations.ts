import {
  trigger,
  transition,
  style,
  query,
  group,
  animateChild,
  animate,
  keyframes,
} from '@angular/animations';

export const slider_old =
  trigger('routeAnimations', [
    transition('* <=> *', [
      // Set a default  style for enter and leave
      query(':enter, :leave', [
        style({
          position: 'absolute',
          left: 0,
          width: '100%',
          opacity: 0,
          transform: 'scale(0) translateY(100%)',
        }),
      ], {optional: true}),
      // Animate the new page in
      query(':enter', [
        animate('300ms ease', style({ opacity: .5, transform: 'scale(1) translateY(0)' })),
        // animate('600ms ease', style({ opacity: 1, transform: 'scale(1) translateY(0)' })),
      ], {optional: true})
    ]),
]);

export const fader =
  trigger('routeAnimations', [
    transition('* => isLeft', slideTo('left') ),
    transition('* => isRight', slideTo('right') ),
    transition('isRight => *', slideTo('left') ),
    transition('isLeft => *', slideTo('right') ),
    transition('* => *', fadeTo()),

    // transition('* => isLeft', fadeTo()),
    // transition('* => isRight', fadeTo()),
    // transition('isRight => *', fadeTo()),
    // transition('isLeft => *', fadeTo()),
    // transition('* => *', fadeTo()),

  ]);

function slideTo(direction) {
  const optional = { optional: true };
  return [
    query(':enter',
      [
          style({ opacity: 0 })
      ],
      { optional: true }
    ),
    query(':leave',
      [
          style({ opacity: 1 }),
          animate(150, style({ opacity: 1 }))
      ],
      { optional: true }
    ),
    query(':enter',
      [
          style({ opacity: 0 }),
          animate(150, style({ opacity: 0 }))
      ],
      { optional: true }
    )
  ];
}

function fadeTo() {
  const optional = { optional: true };
  return [
    query(':enter',
      [
          style({ opacity: 0 })
      ],
      { optional: true }
    ),
    query(':leave',
      [
          style({ opacity: 1 }),
          animate(150, style({ opacity: 1 }))
      ],
      { optional: true }
    ),
    query(':enter',
      [
          style({ opacity: 0 }),
          animate(150, style({ opacity: 0 }))
      ],
      { optional: true }
    )

  ];
}

// trigger('fade', [
//   transition('void => *', [
//     style({opacity: 0}),
//     animate(150, style({opacity: 1}))
//   ]),
//   transition('* => void', [
//     animate(0, style({opacity: 0}))
//   ])
// ])
