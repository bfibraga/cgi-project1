attribute vec4 vPosition;

uniform float table_width;
uniform float table_height;

varying vec4 fColor;

void main()
{
    vec2 resolution = vec2(table_width, table_height);

    gl_PointSize = 6.0;
    vec4 conversion = vec4(resolution.x/2.0, resolution.y/2.0, 1.0, 1.0);
    gl_Position = vPosition / conversion;

    if(vPosition.z > 0.0)
        fColor = vec4(0.0,1.0,0.0,1.0);
    else
        fColor = vec4(1.0,0.0,0.0,1.0);
}
