attribute vec4 vPosition;

uniform float table_width;
uniform float table_height;

varying vec4 fColor;

#define POSITIVE_COLOR vec4(0.0,1.0,0.0,1.0)
#define NEGATIVE_COLOR vec4(1.0,0.0,0.0,1.0)

void main()
{
    vec2 resolution = vec2(table_width, table_height);

    gl_PointSize = 35.0;
    vec4 conversion = vec4(resolution.x/2.0, resolution.y/2.0, 1.0, 1.0);
    gl_Position = vPosition / conversion;

    if(vPosition.z > 0.0)
        fColor = POSITIVE_COLOR;
    else
        fColor = NEGATIVE_COLOR;
}
