attribute vec4 cPosition;
uniform float time;
uniform float table_width;
uniform float table_height;

/*vec4 rotate(float radious, float charge){
    return vec4( sin(time) * radious, charge * cos(time) * radious * 2.0, 0.0, 0.0);
}*/

void main()
{
    gl_PointSize = 4.0;
    gl_Position = cPosition / vec4(table_width/2.0, table_height/2.0, 1.0, 1.0) + vec4(sin(time) * cPosition.z, cPosition.w * cos(time) * cPosition.z * 2.0, 0.0, 0.0);
}

