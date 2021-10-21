attribute vec4 vPosition;

uniform float table_width;
uniform float table_height;

uniform float uTheta;

varying vec4 fColor;

uniform vec2 uTranslation;
uniform vec2 uRotation;

void main()
{
    vec2 resolution = vec2(table_width, table_height);

    float s = sin(uTheta);
    float c = cos(uTheta);

    //Calculate rotation
    vec2 rotation = vec2(
        vPosition.z * (vPosition.x * c - vPosition.y * s),
        vPosition.y * c + vPosition.x * s
    );

    //Calculate the translation
    vec4 position = vec4(rotation.x + uTranslation.x, rotation.y + uTranslation.y, 0.0, 1.0);

    gl_PointSize = 10.0;
    vec4 conversion = vec4(resolution.x/2.0, resolution.y/2.0, 1.0, 1.0);
    gl_Position = position / conversion;

    if(vPosition.z > 0.0)
        fColor = vec4(0.0,1.0,0.0,1.0);
    else
        fColor = vec4(1.0,0.0,0.0,1.0);
}
