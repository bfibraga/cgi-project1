import * as UTILS from '../../libs/utils.js';
import * as MV from '../../libs/MV.js'

/** @type {WebGLRenderingContext} */
let gl;
var program;

let widthloc;
let heightloc;
let thetaloc;

const table_width = 3.0;
let table_height;
let table_center = MV.vec2(table_width/2.0,table_height/2.0);

let vertices = [];
let charges = [];
const MAX_CHARGES = 20;
const ANGULAR_SPEED = 2;

const key = {
    "Space": " "
};

function toggleMagneticField(){
    document.addEventListener("keydown", function(event){
        switch(event.key){
            case key["Space"]:
                //Toggle Magnetic Field
                break;
        }
    });
}

function handleInputCanvas(event, canvas){
    const x = (table_width * event.offsetX) / canvas.width - table_width/2;
    const y = (-table_height * event.offsetY) / canvas.height + table_height/2;
    console.log("Click at (" + x + ", " + y + ")");
    gl.bufferSubData(gl.ARRAY_BUFFER, vertices.length * MV.sizeof["vec2"]  + charges.length * MV.sizeof["vec2"],  MV.flatten(MV.vec2(x,y)));
    charges.push(MV.vec2(x, y));
    if (event.shiftKey){
        //Add Negative Charge
        //TODO:
        //DEBUGGING
        console.log("Negative Charge added")
    } else {
        //Add Positive Charge
        //TODO:
        //DEBUGGING
        console.log("Positive Charge added")
    }

}

function animate(time)
{
    window.requestAnimationFrame(animate);

    time = 0;

    gl.uniform1f(thetaloc, time);

    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(program);
    gl.uniform1f(widthloc, table_width);
    gl.uniform1f(heightloc, table_height);
    gl.drawArrays(gl.POINTS, 0, vertices.length);
    gl.drawArrays(gl.POINTS, vertices.length, charges.length);
}   

function setup(shaders)
{
    const canvas = document.getElementById("gl-canvas");
    gl = UTILS.setupWebGL(canvas);

    program = UTILS.buildProgramFromSources(gl, shaders["shader1.vert"], shaders["shader1.frag"]);

    widthloc = gl.getUniformLocation(program, "table_width");
    heightloc = gl.getUniformLocation(program, "table_height");
    thetaloc = gl.getUniformLocation(program, "utheta");

    canvas.height = window.innerHeight;
    canvas.width = window.innerWidth;
    table_height = (canvas.height * table_width) / canvas.width;
    gl.viewport(0, 0, canvas.width, canvas.height);
    
    const grid_spacing = 0.05;

    const table_offset = grid_spacing/2.0;
    for(let x = -table_width/2 + table_offset; x <= table_width/2; x += grid_spacing) {
        for(let y = -table_height/2 + table_offset; y <= table_height/2; y += grid_spacing) {
            vertices.push(MV.vec2(x, y));
        }
    }

    const pBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices.length*MV.sizeof["vec2"] + MAX_CHARGES*MV.sizeof["vec2"] + (MAX_CHARGES + vertices.length)*MV.sizeof['vec4'], gl.STATIC_DRAW)
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, MV.flatten(vertices));

    const vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    window.addEventListener("resize", function (event) {
        canvas.height = window.innerHeight;
        canvas.width = window.innerWidth;
        table_height = (canvas.height * table_width) / canvas.width;
        gl.viewport(0, 0, canvas.width, canvas.height);
    });

    canvas.addEventListener("click", function (event) {
        handleInputCanvas(event, canvas);
    });

    /*for(let i=0; i<MAX_CHARGES; i++) {
        const uPosition = gl.getUniformLocation(program, "uPosition[" + i + "]");
        gl.uniform2fv(uPosition, MV.flatten(vertices[i]));
    }*/

    toggleMagneticField();
    
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    
    window.requestAnimationFrame(animate);
}

UTILS.loadShadersFromURLS(["shader1.vert", "shader1.frag"]).then(s => setup(s));
