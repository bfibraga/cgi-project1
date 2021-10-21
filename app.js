import * as UTILS from '../../libs/utils.js';
import * as MV from '../../libs/MV.js'

/** @type {WebGLRenderingContext} */
let gl;
var program_charges;
var program_eletric_field;
const table_width = 3.0;
let table_height;

//Eletric Field
var eletric_point = [];
var eletric_new_point = [];

//Uniform Locations
var widthloc;
var heightloc;
var rotationloc;
var translationloc;
var nchargesloc;
var eletric_loc = [];
var thetaloc;

//Charges
let charges = [];
var n_charges = 0;
const MAX = 20;
var rotation = [0.0,1.0];
const ANGULAR_SPEED = 0.025;
var theta = 0;
const NEGATIVE = -1.0;
const POSITIVE = 1.0;
const POSITIVE_COLOR = [0.0,1.0,0.0,1.0];
const NEGATIVE_COLOR = [1.0,0.0,0.0,1.0];
var colors = [];


function animate()
{
    window.requestAnimationFrame(animate);

    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(program_charges);

    theta += ANGULAR_SPEED;
    /*rotation[0] = Math.sin(theta);
    rotation[1] = Math.cos(theta);
    gl.uniform2fv(rotationloc, rotation);*/
    gl.uniform1f(thetaloc, theta);
    gl.uniform2fv(translationloc, [0.0,0.0]);

    gl.uniform1f(widthloc, table_width);
    gl.uniform1f(heightloc, table_height);
    gl.drawArrays(gl.POINTS, 0, eletric_point.length);
    gl.drawArrays(gl.POINTS, eletric_point.length, charges.length);
}

function setup(shaders)
{
    const canvas = document.getElementById("gl-canvas");
    gl = UTILS.setupWebGL(canvas);

    program_charges = UTILS.buildProgramFromSources(gl, shaders["shader_charges.vert"], shaders["shader_charges.frag"]);
    program_eletric_field = UTILS.buildProgramFromSources(gl, shaders["shader_eletric_field.vert"], shaders["shader_eletric_field.frag"]);

    canvas.height = window.innerHeight;
    canvas.width = window.innerWidth;

    table_height = (canvas.height * table_width) / canvas.width;
    
    widthloc = gl.getUniformLocation(program_charges, "table_width");
    heightloc = gl.getUniformLocation(program_charges, "table_height");
    rotationloc = gl.getUniformLocation(program_charges, "uRotation");
    translationloc = gl.getUniformLocation(program_charges, "uTranslation");
    nchargesloc = gl.getUniformLocation(program_charges, "uSize");
    thetaloc = gl.getUniformLocation(program_charges, "uTheta");
    colors = [POSITIVE_COLOR, NEGATIVE_COLOR];
    gl.uniform1i(nchargesloc, 0);

    const grid_spacing = 0.05;

    /*for(let x = -table_width/2; x <= table_width/2; x += grid_spacing) {
        for(let y = -table_height/2; y <= table_height/2; y += grid_spacing) {
            eletric_point.push(MV.vec2(x, y));
        }
    }*/

    const pBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, eletric_new_point.length*MV.sizeof["vec2"] + eletric_point.length*MV.sizeof["vec2"] + MAX*MV.sizeof["vec3"], gl.STATIC_DRAW)
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, MV.flatten(eletric_point));

    const vPosition = gl.getAttribLocation(program_charges, "vPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
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
        if (event.shiftKey){
            var new_charge = MV.vec3(x,y,NEGATIVE);
            gl.bufferSubData(gl.ARRAY_BUFFER, eletric_point.length * MV.sizeof["vec2"]  + charges.length * MV.sizeof["vec3"],  MV.flatten(new_charge));
            charges.push(new_charge);
            console.log("Negative Charge added");
        } else {  
            var new_charge = MV.vec3(x,y,POSITIVE);
            gl.bufferSubData(gl.ARRAY_BUFFER, eletric_point.length * MV.sizeof["vec2"]  + charges.length * MV.sizeof["vec3"],  MV.flatten(new_charge));
            charges.push(new_charge);
            console.log("Positive Charge added");
        }
        const uPosition = gl.getUniformLocation(program_charges, "uPosition[" + n_charges + "]");
        gl.uniform2fv(uPosition, MV.flatten(new_charge));
        n_charges += 1;
        gl.uniform1i(nchargesloc, n_charges);
    });
      
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    
    window.requestAnimationFrame(animate);
}

UTILS.loadShadersFromURLS(["shader_charges.vert", "shader_charges.frag", "shader_eletric_field.vert", "shader_eletric_field.frag"]).then(s => setup(s));
