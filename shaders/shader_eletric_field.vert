attribute vec4 vPosition;
const int MAX_CHARGES=20;
uniform vec2 uPosition[MAX_CHARGES];
uniform float uChargeValues[MAX_CHARGES];
uniform int uSize;

varying vec4 fColor;

uniform float table_width;
uniform float table_height;

#define TWOPI 6.28318530718

// convert angle to hue; returns RGB
// colors corresponding to (angle mod TWOPI):
// 0=red, PI/2=yellow-green, PI=cyan, -PI/2=purple
vec3 angle_to_hue(float angle) {
  angle /= TWOPI;
  return clamp((abs(fract(angle+vec3(3.0, 2.0, 1.0)/3.0)*6.0-3.0)-1.0), 0.0, 1.0);
}

vec3 hsv2rgb(vec3 c)
{
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

vec4 colorize(vec2 f)
{
    float a = atan(f.y, f.x);
    return vec4(angle_to_hue(a-TWOPI), 1.);
}

void main(){
    vec2 resolution = vec2(table_width, table_height);
    vec4 conversion = vec4(resolution.x/2.0, resolution.y/2.0, 1.0, 1.0);
    int size = uSize;
    
    fColor = colorize(vec2(vPosition.x, vPosition.y));
    gl_PointSize = 4.0;
    gl_Position = vPosition / conversion;
}