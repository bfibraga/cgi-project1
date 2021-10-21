attribute vec4 vPosition;

uniform float table_width;
uniform float table_height;

uniform vec2 uTranslation;
uniform vec2 uRotation;

void main()
{
    vec2 resolution = vec2(table_width, table_height);
    //Calculate rotation
    vec2 rotation = vec2(
        vPosition.x * uRotation.y + vPosition.y * uRotation.x,
        vPosition.y * uRotation.y - vPosition.x * uRotation.x
    );

    //Calculate the translation
    vec4 position = vec4(rotation.x + uTranslation.x, rotation.y + uTranslation.y, 1.0, 1.0);

    gl_PointSize = 10.0;
    vec4 conversion = vec4(resolution.x/2.0, resolution.y/2.0, 1.0, 1.0);
    gl_Position = position / conversion;
}
