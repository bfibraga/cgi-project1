import * as UTILS from '../../libs/utils.js';
import * as MV from '../../libs/MV.js'

/** @type {WebGLRenderingContext} */
let gl;
var program_charges;
var program_eletric_field;
const table_width = 3.0;
let table_height;
var pBuffer;
var cBuffer;

//Eletric Field
var eletric_point = [];
const grid_spacing = 0.05;


//Uniform Locations
var widthloc_charges;
var heightloc_charges;
 
var widthloc_eletric;
var heightloc_eletric;

var nchargesloc;
var eletric_loc = [];

//Charges
let charges = [];
var n_charges = 0;
const MAX = 40;
const ANGULAR_SPEED = 0.03;
const POSITIVE = 1.0;
let isActive = true;

const key = {
    "Space": 32
}

function changePos(){
    let s = Math.sin(ANGULAR_SPEED);
    let c = Math.cos(ANGULAR_SPEED);

    for(let i = 0; i < charges.length; i++){
        let rotation = MV.vec3(charges[i][0] * c - charges[i][2] * charges[i][1] * s, charges[i][1] * c + charges[i][2] * charges[i][0] * s, charges[i][2]);
        charges[i] = rotation;
        gl.uniform1i(nchargesloc, charges.length);
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0,  MV.flatten(charges));
}

function animate()
{
    window.requestAnimationFrame(animate);

    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);

    gl.useProgram(program_charges);

    changePos();
    //gl.uniform1i(nchargesloc, 0);
    
    gl.uniform1f(widthloc_charges, table_width);
    gl.uniform1f(heightloc_charges, table_height);
    if(isActive){
        gl.drawArrays(gl.POINTS, 0, charges.length);
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, pBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, MV.flatten(eletric_point));
    gl.useProgram(program_eletric_field);
    gl.uniform1f(widthloc_eletric, table_width);
    gl.uniform1f(heightloc_eletric, table_height);
    gl.drawArrays(gl.POINTS, 0, eletric_point.length);

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
    
    cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, MAX*(MV.sizeof["vec3"] + MV.sizeof["vec4"]), gl.STATIC_DRAW)

    widthloc_charges = gl.getUniformLocation(program_charges, "table_width");
    heightloc_charges = gl.getUniformLocation(program_charges, "table_height");
    nchargesloc = gl.getUniformLocation(program_charges, "uSize");

    const vPositionCharges = gl.getAttribLocation(program_charges, "vPosition");
    gl.vertexAttribPointer(vPositionCharges, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPositionCharges);

    pBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pBuffer);

    for(let x = -table_width/2; x <= table_width/2; x += grid_spacing) {
        for(let y = -table_height/2; y <= table_height/2; y += grid_spacing) {
            eletric_point.push(MV.vec2(x+grid_spacing/2.0, y+grid_spacing/2.0));
        }
    }

    gl.bufferData(gl.ARRAY_BUFFER, eletric_point.length*(MV.sizeof["vec2"] + MV.sizeof["vec4"]), gl.STATIC_DRAW)
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, MV.flatten(eletric_point));

    const vPositionEletric = gl.getAttribLocation(program_eletric_field, "vPosition");
    gl.vertexAttribPointer(vPositionEletric, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPositionEletric);

    widthloc_eletric = gl.getUniformLocation(program_eletric_field, "table_width");
    heightloc_eletric = gl.getUniformLocation(program_eletric_field, "table_height");

    window.addEventListener("resize", function (event) {
        canvas.height = window.innerHeight;
        canvas.width = window.innerWidth;
        table_height = (canvas.height * table_width) / canvas.width;
        gl.viewport(0, 0, canvas.width, canvas.height);
    });

    canvas.addEventListener("click", function(event) {
        const x = (table_width * event.offsetX) / canvas.width - table_width/2;
        const y = (-table_height * event.offsetY) / canvas.height + table_height/2;
        console.log("Click at (" + x + ", " + y + ")");
        gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
        if (event.shiftKey){
            var new_charge = MV.vec3(x,y,-POSITIVE);
            gl.bufferSubData(gl.ARRAY_BUFFER, MV.sizeof["vec3"],  MV.flatten(new_charge));
            charges.push(new_charge);
            console.log("Negative Charge added");
        } else {  
            var new_charge = MV.vec3(x,y,POSITIVE);
            gl.bufferSubData(gl.ARRAY_BUFFER, MV.sizeof["vec3"],  MV.flatten(new_charge));
            charges.push(new_charge);
            console.log("Positive Charge added");
        }

        //gl.bindBuffer(gl.ARRAY_BUFFER, pBuffer);
        const uPosition = gl.getUniformLocation(program_eletric_field, "uPosition[" + n_charges + "]");
        gl.uniform2fv(uPosition, MV.flatten(new_charge));
        n_charges += 1;
        gl.uniform1i(nchargesloc, n_charges);
        console.log(charges);
    });

    window.addEventListener("keydown", function(event){
        if(event.keyCode == key["Space"])
            isActive = !isActive;
    })
      
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    
    window.requestAnimationFrame(animate);
}

UTILS.loadShadersFromURLS(["shader_charges.vert", "shader_charges.frag", "shader_eletric_field.vert", "shader_eletric_field.frag"]).then(s => setup(s));
