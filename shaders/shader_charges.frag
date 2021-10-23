precision mediump float;

varying vec4 fColor;

uniform vec2 uResolution;



vec4 smooth_circle(vec2 position, vec2 translation, float radious){
    float distance = length(position);
    //return vec4(,,,sin(distance/max(uResolution.x,uResolution.y)));
    return vec4(0.0,0.0,0.0,1.0);
}

void main(){
    vec2 position = gl_FragCoord.xy;

    vec4 color = fColor;

    gl_FragColor = color;
}