import * as UTILS from '../../libs/utils.js';
import * as MV from '../../libs/MV.js'

/** @type {WebGLRenderingContext} */
let gl;
var program;
let count = 0;
const table_width = 3.0;
let table_height;

function animate(time)
{
    window.requestAnimationFrame(animate);

    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(program);
    var widthloc = gl.getUniformLocation(program, "table_width");
    gl.uniform1f(widthloc, table_width);
    var heightloc = gl.getUniformLocation(program, "table_height");
    gl.uniform1f(heightloc, table_height);
    gl.drawArrays(gl.POINTS, 0, count);
}

function setup(shaders)
{
    const canvas = document.getElementById("gl-canvas");
    gl = UTILS.setupWebGL(canvas);

    program = UTILS.buildProgramFromSources(gl, shaders["shader1.vert"], shaders["shader1.frag"]);

    canvas.height = window.innerHeight;
    canvas.width = window.innerWidth;

    table_height = (canvas.height * table_width) / canvas.width;

    const vertices = [];
    const grid_spacing = 0.05;

    for(let x = -table_width/2; x <= table_width/2; x += grid_spacing) {
        for(let y = -table_height/2; y <= table_height/2; y += grid_spacing) {
            vertices.push(MV.vec2(x, y));
            count++;
        }
    }

    const pBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, MV.flatten(vertices), gl.STATIC_DRAW)

    const vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    window.addEventListener("resize", function (event) {
        canvas.height = window.innerHeight;
        canvas.width = window.innerWidth;
        table_height = (canvas.height * table_width) / canvas.width;
        gl.viewport(0, 0, canvas.width, canvas.height);
    });

    canvas.addEventListener("click", function(event) {
        // Start by getting x and y coordinates inside the canvas element
        const x = (table_width * event.offsetX) / canvas.width - table_width/2;
        const y = (-table_height * event.offsetY) / canvas.height + table_height/2;
        console.log("Click at (" + x + ", " + y + ")");
    });
      
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    
    window.requestAnimationFrame(animate);
}

UTILS.loadShadersFromURLS(["shader1.vert", "shader1.frag"]).then(s => setup(s));
