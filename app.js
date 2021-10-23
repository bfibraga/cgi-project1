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
var static_eletric_point = [];
const grid_spacing = 0.05;
var widthloc_eletric;
var heightloc_eletric;
var isColorized = true;
var isColorizedloc;


//Charges
let charges = [];
const MAX_CHARGES = 50;
var widthloc_charges;
var heightloc_charges;
var charge_resolution_loc;
var ANGULAR_SPEED = 0.01;
const NEGATIVE = -1.0;
const POSITIVE = 1.0;
let isActive = true;
var CHARGE_VALUE = 10e-12;

const key = {
    "Space": 32,
    "c": 67,
    "+": 107,
    "-": 109,
    "w": 87,
    "s": 83
}

function randomFromInterval(min, max) { // min and max included 
    return Math.random() * (max - min) + min;
}

/**
 * 
 */
function drawEletricField(){
    gl.useProgram(program_eletric_field);
    gl.bindBuffer(gl.ARRAY_BUFFER, pBuffer);
    
    const vPositionEletric = gl.getAttribLocation(program_eletric_field, "vPosition");
    gl.vertexAttribPointer(vPositionEletric, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPositionEletric);

    for(let i=0; i<charges.length; i++) {
        const uPosition = gl.getUniformLocation(program_eletric_field, "uPositionCharges[" + i + "]");
        gl.uniform3fv(uPosition, charges[i]);
        const uCharge = gl.getUniformLocation(program_eletric_field, "uChargeValues[" + i + "]");
        gl.uniform1f(uCharge, charges[i][2] * CHARGE_VALUE);
    }
    
    //gl.bufferSubData(gl.ARRAY_BUFFER, 0, MV.flatten(eletric_point));
    gl.uniform1f(widthloc_eletric, table_width);
    gl.uniform1f(heightloc_eletric, table_height);
    var colorized_int = isColorized ? 1 : 0;
    gl.uniform1i(isColorizedloc, colorized_int);
    gl.drawArrays(gl.LINES, 0, static_eletric_point.length);
}

/**
 * 
 */
function drawCharges(){
    gl.useProgram(program_charges);
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);

    const vPositionCharges = gl.getAttribLocation(program_charges, "vPosition");
    gl.vertexAttribPointer(vPositionCharges, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPositionCharges);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.blendColor(0.0,0.0,0.0,0.0);

    let s = Math.sin(ANGULAR_SPEED);
    let c = Math.cos(ANGULAR_SPEED);

    for(let i = 0; i < charges.length; i++){
        let rotation = MV.vec3(charges[i][0] * c - charges[i][2] * charges[i][1] * s, charges[i][1] * c + charges[i][2] * charges[i][0] * s, charges[i][2]);
        charges[i] = rotation;
    }
    gl.uniform1f(widthloc_charges, table_width);
    gl.uniform1f(heightloc_charges, table_height);
    gl.uniform2fv(charge_resolution_loc, MV.vec2(20,20));
    gl.bufferSubData(gl.ARRAY_BUFFER, 0,  MV.flatten(charges));

    if(isActive){
        gl.drawArrays(gl.POINTS, 0, charges.length);
    }
}

function animate()
{
    window.requestAnimationFrame(animate);

    gl.clear(gl.COLOR_BUFFER_BIT);

    drawEletricField();
    drawCharges();
    
    //gl.uniform1i(nchargesloc, 0);
    
}

function setup(shaders)
{
    const canvas = document.getElementById("gl-canvas");
    gl = UTILS.setupWebGL(canvas);

    //Criação dos programas
    program_charges = UTILS.buildProgramFromSources(gl, shaders["shader_charges.vert"], shaders["shader_charges.frag"]);
    program_eletric_field = UTILS.buildProgramFromSources(gl, shaders["shader_eletric_field.vert"], shaders["shader_eletric_field.frag"]);

    //Alteração Inicial do elemento html canvas
    canvas.height = window.innerHeight;
    canvas.width = window.innerWidth;

    //Corrigir a altura da table de acordo com o canvas e o comprimento da tabela
    table_height = (canvas.height * table_width) / canvas.width;
    
    //Criação do buffer das cargas
    cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, MAX_CHARGES*(MV.sizeof["vec3"] + MV.sizeof["vec4"]), gl.STATIC_DRAW)

    //Atualzação dos valores dos uniform's do programa "program_charges"
    widthloc_charges = gl.getUniformLocation(program_charges, "table_width");
    heightloc_charges = gl.getUniformLocation(program_charges, "table_height");
    charge_resolution_loc = gl.getUniformLocation(program_charges, "uResolution");

    //Criação do buffer do campo eletrico
    pBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pBuffer);

    const interval = grid_spacing/2.0;
    for(let x = -table_width/2; x <= table_width/2; x += grid_spacing) {
        for(let y = -table_height/2; y <= table_height/2; y += grid_spacing) {
            const random_offset_x = randomFromInterval(-interval, interval);
            const random_offset_y = randomFromInterval(-interval, interval);
            const curr_x = x + random_offset_x;
            const curr_y = y + random_offset_y;
            static_eletric_point.push(MV.vec3(curr_x, curr_y, 0.0));
            static_eletric_point.push(MV.vec3(curr_x, curr_y, 1.0));
        }
    }

    console.log(static_eletric_point);

    gl.bufferData(gl.ARRAY_BUFFER, static_eletric_point.length*(MV.sizeof["vec3"] + MV.sizeof["vec4"]), gl.STATIC_DRAW)
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, MV.flatten(static_eletric_point));

    widthloc_eletric = gl.getUniformLocation(program_eletric_field, "table_width");
    heightloc_eletric = gl.getUniformLocation(program_eletric_field, "table_height");
    isColorizedloc = gl.getUniformLocation(program_eletric_field, "uIsColorized");

    window.addEventListener("resize", function (event) {
        canvas.height = window.innerHeight;
        canvas.width = window.innerWidth;
        table_height = (canvas.height * table_width) / canvas.width;
        gl.viewport(0, 0, canvas.width, canvas.height);
    });

    canvas.addEventListener("click", function(event) {
        if(charges.length != MAX_CHARGES){
            const x = (table_width * event.offsetX) / canvas.width - table_width/2;
            const y = (-table_height * event.offsetY) / canvas.height + table_height/2;
            gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
            if (event.shiftKey){
                var new_charge = MV.vec3(x,y,NEGATIVE);
                gl.bufferSubData(gl.ARRAY_BUFFER, MV.sizeof["vec3"],  MV.flatten(new_charge));
                charges.push(new_charge);
                console.log("Negative Charge added");
            } else {  
                var new_charge = MV.vec3(x,y,POSITIVE);
                gl.bufferSubData(gl.ARRAY_BUFFER, MV.sizeof["vec3"],  MV.flatten(new_charge));
                charges.push(new_charge);
                console.log("Positive Charge added");
            }
        }
    });

    window.addEventListener("keydown", function(event){
        switch(event.keyCode){
            //Toggle visibility of the charges
            case key["Space"]:
                isActive = !isActive;
                break;
            //Toggle color filter
            case key["c"]:
                isColorized = !isColorized;
                break;
            case key["+"]:
                CHARGE_VALUE += 0.0000000000025;
                break;
            case key["-"]:
                CHARGE_VALUE -= 0.0000000000025;
                break;
            case key["w"]:
                ANGULAR_SPEED += 1e-2;
                break;
            case key["s"]:
                ANGULAR_SPEED -= 1e-2;
                break;
        }
        console.log(CHARGE_VALUE);
    })
      
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    
    window.requestAnimationFrame(animate);
}

UTILS.loadShadersFromURLS(["shader_charges.vert", "shader_charges.frag", "shader_eletric_field.vert", "shader_eletric_field.frag"]).then(s => setup(s));
