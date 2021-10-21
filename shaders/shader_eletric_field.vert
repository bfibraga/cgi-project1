attribute vec4 vPosition;
const int MAX_CHARGES=20;
uniform vec2 uPosition[MAX_CHARGES];
uniform float uChargeValues[MAX_CHARGES];
uniform int uSize;

uniform float table_width;
uniform float table_height;

vec4 CoulombLaw(vec2 position, float value){
    return vec4(0.0,0.0,0.0,1.0);
}

void main(){
    vec2 resolution = vec2(table_width, table_height);
    vec4 conversion = vec4(resolution.x/2.0, resolution.y/2.0, 1.0, 1.0);
    int size = uSize;
    vec4 position = vec4(0.0,0.0,0.0,1.0);
    /*for (int i = 0 ; i < size ; i++){
        vec4 res = CoulombLaw(uPosition[i], uChargeValues[i]);
        position = vec4(position.x + res.x, position.y + res.y, 0.0, 1.0);
    }*/
    
    gl_PointSize = 4.0;
    gl_Position = vPosition / conversion;
}