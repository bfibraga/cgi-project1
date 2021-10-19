import * as UTILS from '../../libs/utils.js';
import * as MV from '../../libs/MV.js'

/** @type {WebGLRenderingContext} */
let gl;
var program;

let widthloc;
let heightloc;
let thetaloc;
let pointsizeloc;

const table_width = 3.0;
let table_height;
let table_center;

let position = [];
let endPosition = [];
let charges = [];
const MAX_CHARGES = 20;
const KE = 9 * Math.pow(10,9);
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

function canvas2table(x,y, canvas){
    return MV.vec2((table_width * x) / canvas.width - table_width/2, 
    (-table_height * y) / canvas.height + table_height/2);
}

function cursorInTable(x,y){
    //console.log(table_center[0] + " " + table_center[1]);
    return x > -table_width/2.0 && x < table_width/2.0 && y > -table_height/2.0 && y < table_height/2.0;
}

function handleInputCanvas(event, canvas){
    const x = (table_width * event.offsetX) / canvas.width - table_width/2;
    const y = (-table_height * event.offsetY) / canvas.height + table_height/2;
    console.log("Click at (" + x + ", " + y + ")");
    gl.bufferSubData(gl.ARRAY_BUFFER, position.length * MV.sizeof["vec3"]  + charges.length * MV.sizeof["vec3"],  MV.flatten(MV.vec3(x,y,1)));
    charges.push(MV.vec2(x,y));
    
    if (cursorInTable(x,y)){
        if (event.shiftKey){
            //Add Negative Charge
            //TODO:
            //DEBUGGING
            console.log("Negative Charge added")
        } else {
            //Add Positive Charge
            //TODO:
            //DEBUGGING
            console.log("Positive Charge added");
            gl.drawArrays(gl.POINTS, 0, position.length);
            //gl.drawArrays(gl.POINTS, position.length, charges.length);
        }
    }
}

function randomFromInterval(min, max) { // min and max included 
    const range = max - min;
    const random = (Math.random()) / max;
    return (random*range)+min;
}

function coulombLaw(v1, array_v){
    var res = MV.vec3(0.0,0.0,0.0);

    for (var i = 0 ; i < array_v.length ; i++){
        var v = array_v[i];
        const r = Math.pow((v1[0] - v[0]),2) + Math.pow((v1[0] - v[0]));
        const q = v[2];
        res[0] = (v[0]*q*(KE/r))/q;
        res[1] = (v[1]*q*(KE/r))/q;
    }
    return res;
}

function animate(time)
{
    window.requestAnimationFrame(animate);

    time = 0;

    gl.uniform1f(thetaloc, time);

    gl.clear(gl.COLOR_BUFFER_BIT);

    //Resize of the Canvas
    gl.useProgram(program);
    gl.uniform1f(widthloc, table_width);
    gl.uniform1f(heightloc, table_height);

    //Drawing points
    gl.drawArrays(gl.LINE_STRIP, 0, position.length);
    gl.drawArrays(gl.POINTS, position.length, charges.length);
}   

function setup(shaders)
{
    const canvas = document.getElementById("gl-canvas");
    gl = UTILS.setupWebGL(canvas);

    program = UTILS.buildProgramFromSources(gl, shaders["shader_eletric_field.vert"], shaders["shader_eletric_field.frag"]);

    widthloc = gl.getUniformLocation(program, "table_width");
    heightloc = gl.getUniformLocation(program, "table_height");
    thetaloc = gl.getUniformLocation(program, "utheta");

    canvas.height = window.innerHeight;
    canvas.width = window.innerWidth;
    table_height = (canvas.height * table_width) / canvas.width;
    table_center = MV.vec3(table_width/2.0,table_height/2.0, 0.1);
    charges.push(table_center);
    gl.viewport(0, 0, canvas.width, canvas.height);
    
    const grid_spacing = 0.05;

    const table_offset = grid_spacing/2.0;
    for(let x = -table_width/2 + table_offset; x <= table_width/2; x += grid_spacing) {
        for(let y = -table_height/2 + table_offset; y <= table_height/2; y += grid_spacing) {
            const randOffsetX = randomFromInterval(-table_offset, table_offset);
            const randOffsetY = randomFromInterval(-table_offset, table_offset);
            const pos = MV.vec3(x,y, 1.0);
            const pos2 = MV.vec3(x+0.02,y+0.02, 1.0)
            position.push(pos);
            position.push(pos2);
        }
    }

    const pBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, position.length*MV.sizeof["vec3"] + MAX_CHARGES*MV.sizeof["vec3"] + (MAX_CHARGES + position.length)*MV.sizeof['vec4'], gl.STATIC_DRAW)
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, MV.flatten(position));

    const vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, MV.sizeof["vec3"], 0);
    gl.enableVertexAttribArray(vPosition);

    window.addEventListener("resize", function (event) {
        canvas.height = window.innerHeight;
        canvas.width = window.innerWidth;
        table_height = (canvas.height * table_width) / canvas.width;
        table_center = MV.vec2(table_width/2.0,table_height/2.0)
        gl.viewport(0, 0, canvas.width, canvas.height);
    });

    canvas.addEventListener("click", function (event) {
        handleInputCanvas(event, canvas);
    });

    for(let i=0; i<MAX_CHARGES; i++) {
        const uPosition = gl.getUniformLocation(program, "uPosition[" + i + "]");
        gl.uniform2fv(uPosition, MV.flatten(position[i]));
        const uEndPosition = gl.getUniformLocation(program, "uEndPosition[" + i + "]");
        //gl.uniform2fv(uEndPosition, MV.flatten(endPosition[i]));
    }

    console.log(position[0]);
    console.log(position[1]);

    toggleMagneticField();
    
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    
    window.requestAnimationFrame(animate);
}

UTILS.loadShadersFromURLS(["shader_eletric_field.vert", "shader_eletric_field.frag"]).then(s => setup(s));
