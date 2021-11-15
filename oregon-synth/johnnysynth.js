const createSynth = require('./plumbing/synth')

module.exports = function ({regl, audioContext, keyboard}) {
  createSynth({
    regl,
    audioContext,
    keyboard,
    shader: `
    float tau = 6.2841;
    float standard(float x) {
      return pow(exp(1.), -1./2. * pow(x, 2.)) / tau;
    }

    float general(float x, float u, float s){
      return (1. / s) * standard(x - u) / s;
    }


    float sine(float t, float f) {
      float m = 1. / f;
      return sin(mod(t, m) * tau * f);
    }

    float tri(float t, float f) {
      float m = 1. / f;
      return abs(1. - mod(mod(t,m), (1./f)) * f * 2.) * 2. - 1.;
    }

    float overtone(float t, float f, float u, float s, float m, int i) {
      float x = 1.;
        float y = 0.;
        int z = 7;
        for(int ii = 0; ii <= 7*1; ii++){
            float g = general(x, u, s);
          y += sine(t, x * f) * g;
            x *= pow(2., m);
        }
        return y;	
    }

    float quant(float v, float q) {
      return floor(v/q)*q;
    }

    float amod(float t, float c, float r, float f) {
      return c + (r * sine(t, f));
    }
    float pcm(float t, vec3 keys[NUM_KEYS]) {
      float result = 0.0;
      float bpm = 72./60.;
      t *= bpm;
      float tt = t;
      t = mod(t, 16.);
      result += overtone(t, ceil(pow(2., mod(t/4., 8.)/12.)) * 441./4./bpm, amod(t + .5, 0., tau/4., 4.), amod(t, sqrt(3.141)/8., -1./16., 64.* 2.), amod(t, 15./12., 3./12., 1./4.), 7); 
      result *= amod(t + floor(amod(t, 0., 5., 1./128.)) / 10., 2./4., 1./2., floor(mod(t*8., 32.))/8.);
      float sn = sine(t, sine(t, 10000.)) * (1. - tri(t, 2.));
      return quant(((result)), amod(t, 1./12., -1./16., 1./3.));
    }`,
    filter: `
    float tau_ = 3.141579 * 2.;
    float sine(float t, float f) {
      float m = 1. / f;
      return sin(mod(t, m) * tau_ * f);

    }
    float amod(float t, float c, float r, float f) {
      return c + (r * sine(t, f));
    }

    float filter(vec3 keys[NUM_KEYS]) {
       return sample(amod(shift, tau_, tau_ / 3., (mod(mod(shift * 32., 16.), 3./4.))));
    }
    `
  }).connect(audioContext.destination)
}
