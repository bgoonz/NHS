module.exports = mix

function toCMYK(color){
  console.log(color)
  var cyan    = 255 - color[0];
  var magenta = 255 - color[1];
  var yellow  = 255 - color[2];
  black   = Math.min(cyan, magenta, yellow);
  cyan    = ((cyan - black) / (255 - black));
  magenta = ((magenta - black) / (255 - black));
  yellow  = ((yellow  - black) / (255 - black));

  return {c:cyan,m:magenta,y:yellow,k:black/255,a:color[3]};
}

function toRGB(color){
  color.c = color.c;
  color.m = color.m;
  color.y = color.y;
  color.k = color.k;
  var R = color.c * (1.0 - color.k) + color.k;
  var G = color.m * (1.0 - color.k) + color.k;
  var B = color.y * (1.0 - color.k) + color.k;
  R = Math.round((1.0 - R) * 255.0 + 0.5);
  G = Math.round((1.0 - G) * 255.0 + 0.5);
  B = Math.round((1.0 - B) * 255.0 + 0.5);
  color = [R,G,B,Math.round(color.a)]
  return color;
}

function mix(color1,color2){
  color1 = new Array(color1,color2);
  console.log(color1)
  var C = 0;
  var M = 0;
  var Y = 0;
  var K = 0;
  var A = 0;
  for(var i=0;i<color1.length;i++){
    color1[i] = toCMYK(color1[i]);
    console.log(color1[i])
    C += color1[i].c;
    M += color1[i].m;
    Y += color1[i].y;
    K += color1[i].k;
    A += color1[i].a;
  }
  C = C/color1.length;
  M = M/color1.length;
  Y = Y/color1.length;
  K = K/color1.length;
  A = A/color1.length;
  var color = {c:C,m:M,y:Y,k:K,a:A};
  color = toRGB(color);
  return color;
}
