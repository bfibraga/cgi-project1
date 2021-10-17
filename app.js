import * as UTILS from '../../libs/utils.js';
import * as MV from '../../libs/MV.js'

/** @type {WebGLRenderingContext} */
let gl;
var program;
var vertice_count = 0;

//Bancada
const table_width = 3.0;
let table_height;

function animate(time)
{
    window.requestAnimationFrame(animate);

    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(program)
    
    var table_vert_width = gl.getUniformLocation(program, "table_width");
    var table_vert_heigth = gl.getUniformLocation(program, "table_height");

    gl.uniform1f(table_vert_width, table_width);
    gl.uniform1f(table_vert_heigth, table_height);

    gl.drawArrays(gl.POINTS, 0, vertice_count);
    
}

function setup(shaders)
{
    const canvas = document.getElementById("gl-canvas");
    gl = UTILS.setupWebGL(canvas);

    program = UTILS.buildProgramFromSources(gl, shaders["shader1.vert"], shaders["shader1.frag"]);

    // Full window sized canvas
    canvas.height = window.innerHeight;
    canvas.width = window.innerWidth;

    table_height = (canvas.height * table_width)/canvas.width;

    const grid_spacing = 0.05;
    const vertices = [];

    for(let x = -table_width; x <= table_width; x += grid_spacing) {
        for(let y = -table_height; y <= table_height; y += grid_spacing) {
            vertices.push(MV.vec2(x, y));
        }
    }

    vertice_count = vertices.length;

    window.addEventListener("resize", function (event) {
        // Event handler code goes here!
        canvas.height = window.innerHeight;
        canvas.width = window.innerWidth;
        table_height = (canvas.height * table_width)/canvas.width;
    });

     //Create Buffer
     const gl_buffer = gl.createBuffer();
     gl.bindBuffer(gl.ARRAY_BUFFER, gl_buffer);
     gl.bufferData(gl.ARRAY_BUFFER, MV.flatten(vertices), gl.DYNAMIC_DRAW); 

     const vPosition = gl.getAttribLocation(program, "vPosition");
     gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
     gl.enableVertexAttribArray(vPosition);

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    
    window.requestAnimationFrame(animate);
}

UTILS.loadShadersFromURLS(["shader1.vert", "shader1.frag"]).then(s => setup(s));
