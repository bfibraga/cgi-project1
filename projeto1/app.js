import * as UTILS from '../../libs/utils.js';
import * as MV from '../../libs/MV.js'

/** @type {WebGLRenderingContext} */
let gl;
var programVert;
var programCharges;

let widthloc;
let heightloc;
let thetaloc;
let widthloc1;
let heightloc1;
let thetaloc1;
let pointsizeloc;

const table_width = 3.0;
let table_height;
let table_center;
var curr_time = 0

let position = [];
let endPosition = [];
let charges = [];
const NEGATIVE = 1.0;
const POSITIVE = -1.0;
const MAX_CHARGES = 20;
const KE = 8.99 * Math.pow(10,9);
const ANGULAR_SPEED = 2 * Math.PI / 5.0;

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

function cursorInTable(x,y){
    //console.log(table_center[0] + " " + table_center[1]);
    return x > -table_width/2.0 && x < table_width/2.0 && y > -table_height/2.0 && y < table_height/2.0;
}

function randomFromInterval(min, max) { // min and max included 
    return Math.random() * (max - min) + min;
}

function animate(time)
{
    window.requestAnimationFrame(animate);

    time *= 0.001;

    gl.uniform1f(thetaloc, time);

    gl.clear(gl.COLOR_BUFFER_BIT);

    //Resize of the Canvas
    gl.useProgram(programVert);
    gl.uniform1f(widthloc, table_width);
    gl.uniform1f(heightloc, table_height);

    //Drawing points
    //gl.drawArrays(gl.LINE_STRIP, 0, position.length);

    gl.useProgram(programCharges);
    gl.uniform1f(widthloc1, table_width);
    gl.uniform1f(heightloc1, table_height);


    var timeloc = gl.getUniformLocation(programCharges, "time");
    gl.uniform1f(timeloc, time);
    gl.drawArrays(gl.POINTS, 0, charges.length);
}   

function setup(shaders)
{
    const canvas = document.getElementById("gl-canvas");
    gl = UTILS.setupWebGL(canvas);

    programVert = UTILS.buildProgramFromSources(gl, shaders["shader_eletric_field.vert"], shaders["shader_eletric_field.frag"]);
    programCharges = UTILS.buildProgramFromSources(gl, shaders["shader1.vert"], shaders["shader1.frag"]);

    widthloc = gl.getUniformLocation(programVert, "table_width");
    heightloc = gl.getUniformLocation(programVert, "table_height");
    thetaloc = gl.getUniformLocation(programVert, "utheta");

    widthloc1 = gl.getUniformLocation(programCharges, "table_width");
    heightloc1 = gl.getUniformLocation(programCharges, "table_height");
    thetaloc1 = gl.getUniformLocation(programCharges, "utheta");

    canvas.height = window.innerHeight;
    canvas.width = window.innerWidth;
    table_height = (canvas.height * table_width) / canvas.width;
    table_center = MV.vec3(table_width / canvas.width - table_width/2.0,-table_height / canvas.height + table_height/2.0, 0.1);

    console.log(table_center);
    
    //charges.push(table_center);
    
    gl.viewport(0, 0, canvas.width, canvas.height);
    
    const grid_spacing = 0.05;

    const table_offset = grid_spacing/2.0;
    /*for(let x = -table_width/2 + table_offset; x <= table_width/2; x += grid_spacing) {
        for(let y = -table_height/2 + table_offset; y <= table_height/2; y += grid_spacing) {
            const randOffsetX = randomFromInterval(-table_offset, table_offset);
            const randOffsetY = randomFromInterval(-table_offset, table_offset);
            const pos = MV.vec3(x,y, 1.0);
            const pos2 = MV.vec3(x+0.02,y+0.02, 1.0)
            position.push(pos);
            position.push(pos2);
        }
    }*/

    const pBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, position.length*MV.sizeof["vec2"] + MAX_CHARGES*MV.sizeof["vec4"] + (MAX_CHARGES + position.length)*MV.sizeof['vec4'], gl.STATIC_DRAW)
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, MV.flatten(position));

    const vPosition = gl.getAttribLocation(programVert, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    const cPosition = gl.getAttribLocation(programCharges, "cPosition");
    gl.vertexAttribPointer(cPosition, 2, gl.FLOAT, false, MV.sizeof["vec4"], 0);
    gl.enableVertexAttribArray(cPosition);

    window.addEventListener("resize", function (event) {
        canvas.height = window.innerHeight;
        canvas.width = window.innerWidth;
        table_height = (canvas.height * table_width) / canvas.width;
        table_center = MV.vec3(table_width / canvas.width - table_width/2.0,-table_height / canvas.height + table_height/2.0, 0.1);
        gl.viewport(0, 0, canvas.width, canvas.height);
    });

    canvas.addEventListener("click", function(event) {
        const x = (table_width * event.offsetX) / canvas.width - table_width/2;
        const y = (-table_height * event.offsetY) / canvas.height + table_height/2;
        console.log("Click at (" + x + ", " + y + ")");
        //gl.bufferSubData(gl.ARRAY_BUFFER, position.length * MV.sizeof["vec3"]  + charges.length * MV.sizeof["vec4"],  MV.flatten(charges));
        //var radious = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
        var radious = randomFromInterval(0.0, 0.1);
        var colorloc = gl.getUniformLocation(programCharges, "fColor");
        if (event.shiftKey){
            gl.uniform4fv(colorloc, [1.0,0.0,0.0,1.0]);
            charges.push(MV.vec4(0.0, 0.0, radious, NEGATIVE));
            gl.bufferSubData(gl.ARRAY_BUFFER, charges.length * MV.sizeof["vec4"],  MV.flatten(MV.vec4(0.0, 0.0, radious, NEGATIVE)));
            console.log("Negative Charge added");
        } else {  
            gl.uniform4fv(colorloc, [0.0,1.0,0.0,1.0]);  
            charges.push(MV.vec4(x, y, radious, POSITIVE));
            gl.bufferSubData(gl.ARRAY_BUFFER, charges.length * MV.sizeof["vec4"],  MV.flatten(MV.vec4(x, y, radious, POSITIVE)));
            console.log("Positive Charge added");
        }
        console.log(charges);
    });

    /*for(let i=0; i<MAX_CHARGES; i++) {
        const uPosition = gl.getUniformLocation(program, "uPosition[" + i + "]");
        gl.uniform2fv(uPosition, MV.flatten(position[i]));
        const uEndPosition = gl.getUniformLocation(program, "uEndPosition[" + i + "]");
        //gl.uniform2fv(uEndPosition, MV.flatten(endPosition[i]));
    }*/

    toggleMagneticField();
    
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    
    window.requestAnimationFrame(animate);
}

UTILS.loadShadersFromURLS(["shader_eletric_field.vert", "shader_eletric_field.frag", "shader1.vert", "shader1.frag"]).then(s => setup(s));
