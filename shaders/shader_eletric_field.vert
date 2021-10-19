attribute vec4 vPosition;
uniform float table_width;
uniform float table_height;
uniform float utheta;

varying vec4 fColor;

uniform vec2 uTable_center;

uniform float uPointSize;

const int MAX_CHARGES=20;
uniform vec2 uPosition[MAX_CHARGES];
uniform vec2 uEndPosition[MAX_CHARGES];

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
    return vec4(angle_to_hue(a-TWOPI), 1.0);
}

vec4 rotate(vec4 p, float angle) {
    float s = sin(angle);
    float c = cos(angle);

    return vec4((-s * p.y + c * p.x),(s * p.x + c * p.y),0.0,1.0);
}

float dotProdVec2(vec4 v1, vec4 v2) {
    return v1.x*v2.x + v1.y*v2.y;
}

float norm(vec4 v){
    float res;
    res += v.x*v.x;
    res += v.y*v.y;
    return sqrt(res);
}

float angleBetween(vec4 v1, vec4 v2){
    return acos(dotProdVec2(v1, v2) / (norm(v1) * norm(v2)));
}

void main()
{
    gl_Position = vPosition;
    gl_PointSize = 4.0;
    gl_Position /= vec4(table_width/2.0, table_height/2.0, 1.0, 1.0);
    fColor = colorize(vec2(vPosition.x, vPosition.y));
}
