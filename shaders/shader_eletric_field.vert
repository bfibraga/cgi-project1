attribute vec4 vPosition;
varying vec4 fColor;

const int MAX_CHARGES=50;
uniform vec3 uPositionCharges[MAX_CHARGES];
uniform float uChargeValues[MAX_CHARGES];
const float KE = 8.988 * pow(10.0, 9.0);
const float MAX_LINE_LENGTH=0.09;

uniform float table_width;
uniform float table_height;

#define TWOPI 6.28318530718
#define VEC2ZERO vec2(0.0,0.0)
#define VEC4ZERO vec4(0.0,0.0,0.0,0.0)

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

vec2 calculate_intensity_field (){
    vec2 result = VEC2ZERO;
    for(int i = 0; i < MAX_CHARGES; i++){
        float distance = sqrt(pow(vPosition.x - uPositionCharges[i].x, 2.0) + pow(vPosition.y - uPositionCharges[i].y, 2.0));
        vec2 direction = vec2(vPosition.x - uPositionCharges[i].x, vPosition.y - uPositionCharges[i].y);
        float intensity = KE * uChargeValues[i] / (distance * distance);
        result += vec2(intensity, intensity) * normalize(direction);
        
    }

    if (length(result) > MAX_LINE_LENGTH){
        result = normalize(result);
        result.x *= MAX_LINE_LENGTH;
        result.y *= MAX_LINE_LENGTH;
    }

    fColor = colorize(result);

    return result;
}

void main(){
    vec2 resolution = vec2(table_width, table_height);
    vec4 conversion = vec4(resolution.x/2.0, resolution.y/2.0, 1.0, 1.0);
    
    vec4 direction_result = VEC4ZERO;

    //Verificar se carga movivel ou carga estatica
    //1- Mobile
    //0- Static
    if (vPosition.z == 1.0){
        vec2 intensity = calculate_intensity_field();
        direction_result = vec4(intensity.x, intensity.y, 0.0, 0.0);
    } else {
        fColor= vec4(0.0,0.0,0.0,1.0);
    }
    
    
    gl_Position = (vPosition + direction_result) / conversion ;
}