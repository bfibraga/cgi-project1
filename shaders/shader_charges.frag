precision highp float;
varying vec4 fColor;

#define POSITIVE_COLOR vec4(0.0,1.0,0.0,1.0)
#define NEGATIVE_COLOR vec4(1.0,0.0,0.0,1.0)

float inSignal(vec2 position, vec2 top_limit, vec2 bottom_limit){
    return position.x > bottom_limit.x && position.y > bottom_limit.y && position.x < top_limit.x && position.y < top_limit.y ? 0.0 : 1.0;
}

vec4 drawCharge(vec2 position, vec4 color, float inner_radious, float out_radious){
    //Drawing circle
    float distance = length(position);
    float color_intensity = smoothstep(inner_radious, out_radious,(distance));

    //Drawing Signal
    vec2 topleft_limit = vec2(0.7,0.2);
    vec2 bottomright_limit = vec2(-0.7,-0.2);
    float isSignalNegative = inSignal(position, topleft_limit, bottomright_limit);

    float isSignalPositive = 1.0;
    if(fColor == POSITIVE_COLOR){
        topleft_limit = vec2(0.2,0.7);
        bottomright_limit = vec2(-0.2,-0.7);
        isSignalPositive = inSignal(position, topleft_limit, bottomright_limit);
    }

    return vec4(color.x*isSignalNegative*isSignalPositive, 
                color.y*isSignalNegative*isSignalPositive, 
                color.z*isSignalNegative*isSignalPositive,
                (1.0 - color_intensity));
}

void main() {
    vec2 fragmentPosition = 2.0*gl_PointCoord - 1.0;
    gl_FragColor = drawCharge(fragmentPosition, fColor, 0.5, 1.0);
}