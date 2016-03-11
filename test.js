var jstat = require('./app/library/jstat');

var n_A = 1000;                       // number of clicks on page A
var X_A = 500;                        // number of shares on page A

var n_B = 400;                        // number of clicks on page B
var X_B = 224;                        // number of shares on page B

var piHat_A = X_A / n_A;              // proportion of successes in group A
var piHat_B = X_B / n_B;              // proportion of successes in group B
var piHat = (X_A + X_B)/(n_A + n_B);  // average proportion of successes

var SE = Math.sqrt(piHat * (1 - piHat) * ((1/n_A)+(1/n_B)) )    // standard error

var z = (piHat_A - piHat_B) / SE;
var zSquared = Math.pow(z, 2);



var pnorm2 = jstat.pnorm(Math.abs(z) * -1) * 2;



console.log('piHat_A:', piHat_A);
console.log('piHat_B:', piHat_B);
console.log('piHat:', piHat);
console.log('SE:', SE);
console.log('    (1 - piHat):', (1 - piHat));
console.log('    ((1/n_A)+(1/n_B)):', ((1/n_A)+(1/n_B)));
console.log('    (piHat * (1 - piHat) * ((1/n_A)+(1/n_B)) ):',(piHat * (1 - piHat) * ((1/n_A)+(1/n_B)) ));
console.log('z:', z);
console.log('zSquared:', zSquared);
console.log('pnorm2:', pnorm2);


