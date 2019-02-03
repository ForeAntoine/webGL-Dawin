function loadText(url) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);
    xhr.overrideMimeType("text/plain");
    xhr.send(null);
    if(xhr.status === 200)
        return xhr.responseText;
    else {
        return null;
    }
}

// variables globales du programme;
var canvas;
var gl; //contexte
var program; //shader program
var attribPos; //attribute position
var attribProj; //attribute projection
var attribTrans;
var getPosition = [0, 0];
var pointSize = 10.0;
var buffer;
var rota = 0;
var project; //matrice de projection
var arrayPositions = [
    //face1 (devant)
    -0.5, -0.5, 0.5,
    -0.5, 0.5, 0.5,
    0.5, 0.5, 0.5,

    -0.5, -0.5, 0.5,
    0.5, -0.5, 0.5,
    0.5, 0.5, 0.5,

    //face2 (derriere)
    -0.5, -0.5, -0.5,
    -0.5, 0.5, -0.5,
    0.5, 0.5, -0.5,

    -0.5, -0.5, -0.5,
    0.5, -0.5, -0.5,
    0.5, 0.5, -0.5,

    //face3 (gauche)
    -0.5, 0.5, 0.5,
    -0.5, -0.5, 0.5,
    -0.5, -0.5, -0.5,

    -0.5, 0.5, 0.5,
    -0.5, 0.5, -0.5,
    -0.5, -0.5, -0.5,

    //face4 (droite)
    0.5, 0.5, 0.5,
    0.5, -0.5, 0.5,
    0.5, -0.5, -0.5,

    0.5, 0.5, 0.5,
    0.5, 0.5, -0.5,
    0.5, -0.5, -0.5,

    //face5 (haut)
    -0.5, 0.5, 0.5,
    -0.5, 0.5, -0.5,
    0.5, 0.5, 0.5,

    0.5, 0.5, 0.5,
    0.5, 0.5, -0.5,
    -0.5, 0.5, -0.5,

    //face6 (bas)
    -0.5, -0.5, 0.5,
    -0.5, -0.5, -0.5,
    0.5, -0.5, 0.5,

    0.5, -0.5, 0.5,
    0.5, -0.5, -0.5,
    -0.5, -0.5, -0.5
];

cyan1 = 26/255;
cyan2 = 188/255;
cyan3 = 156/255;

black1 = 44/255;
black2 = 62/255;
black3 = 80/255;

amethyst1 = 155/255;
amethyst2 = 89/255;
amethyst3 = 182/255;

green1 = 46/255;
green2 = 204/255;
green3 = 113/255;

red1 = 192/255;
red2 = 57/255;
red3 = 43/255;

white1 = 236/255;
white2 = 240/255;
white3 = 241/255;


var color = [
    cyan1, cyan2, cyan3,
    cyan1, cyan2, cyan3,
    cyan1, cyan2, cyan3,
    cyan1, cyan2, cyan3,
    cyan1, cyan2, cyan3,
    cyan1, cyan2, cyan3,

    black1, black2, black3,
    black1, black2, black3,
    black1, black2, black3,
    black1, black2, black3,
    black1, black2, black3,
    black1, black2, black3,

    amethyst1, amethyst2, amethyst3,
    amethyst1, amethyst2, amethyst3,
    amethyst1, amethyst2, amethyst3,
    amethyst1, amethyst2, amethyst3,
    amethyst1, amethyst2, amethyst3,
    amethyst1, amethyst2, amethyst3,

    green1, green2, green3,
    green1, green2, green3,
    green1, green2, green3,
    green1, green2, green3,
    green1, green2, green3,
    green1, green2, green3,

    red1, red2, red3,
    red1, red2, red3,
    red1, red2, red3,
    red1, red2, red3,
    red1, red2, red3,
    red1, red2, red3,
    
    white1, white2, white3,
    white1, white2, white3,
    white1, white2, white3,
    white1, white2, white3,
    white1, white2, white3,
    white1, white2, white3
]

function initContext(){
    canvas = document.getElementById('dawin-webgl');
    gl = canvas.getContext('webgl');
    if (!gl) {
        console.log('ERREUR : echec chargement du contexte');
        return;
    }
    gl.clearColor(0.1, 0.1, 0.1, 1.0);
}

//Initialisation des shaders et du program
function initShaders(){
    var fragmentSource = loadText('fragment.glsl');
    var vertexSource = loadText('vertex.glsl');

    var fragment = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragment, fragmentSource);
    gl.compileShader(fragment);

    var vertex = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertex, vertexSource);
    gl.compileShader(vertex);

    gl.getShaderParameter(fragment, gl.COMPILE_STATUS);
    gl.getShaderParameter(vertex, gl.COMPILE_STATUS);

    if (!gl.getShaderParameter(fragment, gl.COMPILE_STATUS)) {
        console.log(gl.getShaderInfoLog(fragment));
    }

    if (!gl.getShaderParameter(vertex, gl.COMPILE_STATUS)) {
        console.log(gl.getShaderInfoLog(vertex));
    }

    program = gl.createProgram();
    gl.attachShader(program, fragment);
    gl.attachShader(program, vertex);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.log("Could not initialise shaders");
    }
    gl.useProgram(program);
}

//Fonction initialisant les attributs pour l'affichage (position et taille)
function initAttributes(){
    attribPos = gl.getAttribLocation(program, "position");
    attribTrans = gl.getUniformLocation(program, "translation");
    attribRot = gl.getUniformLocation(program, "rotation");
    attribProj = gl.getUniformLocation(program, "projection");
    attribColor = gl.getAttribLocation(program, "couleur");
}

//Initialisation des buffers
function initBuffers(){
    //init buffer de points
    buffer= gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(arrayPositions), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(attribPos);
    gl.vertexAttribPointer(attribPos, 3, gl.FLOAT, true, 0, 0);

    colorBuffer = gl.createBuffer();
    gl.enableVertexAttribArray(attribColor);
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(color), gl.STATIC_DRAW);
    gl.vertexAttribPointer(attribColor, 3, gl.FLOAT, true, 0, 0);
}

//Fonction permettant le dessin dans le canvas
function draw(){
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, arrayPositions.length/3);
}

function initProject(){
    project = mat4.create();
    mat4.perspective(project, 1.5, 1, 0.01, 15);
    gl.uniformMatrix4fv(attribProj, false, project);

    var vec = vec3.fromValues(0,0,-2);
    translate = mat4.create();
    mat4.fromTranslation(translate,vec);
    gl.uniformMatrix4fv(attribTrans, false, translate);

    rotation = mat4.create();
    mat4.fromYRotation(rotation, 0.8);
    gl.uniformMatrix4fv(attribRot, false, rotation);
}

function initEvents() {
    document.getElementById("rx").onclick = function(e){
        rotationDrawing();
    }
    document.getElementById("ry").onclick = function(e){
        rotationDrawing();
    }
    document.getElementById("rz").onclick = function(e){
        rotationDrawing();
    }

    document.getElementById("tx").onclick = function(e){
        translationDrawing();
    }
    document.getElementById("ty").onclick = function(e){
        translationDrawing();
    }
    document.getElementById("tz").onclick = function(e){
        translationDrawing();
    }

    document.getElementById("zoom").onclick = function(e){
        perspectiveDrawing();
    }
    document.getElementById("fov").onclick = function(e){
        perspectiveDrawing();
    }
}

function perspectiveDrawing(){
    project = mat4.create();
    mat4.perspective(project, document.getElementById("zoom").value/10, 1+document.getElementById("fov").value/10, 0.01, 15);
    gl.uniformMatrix4fv(attribProj, false, project);
    draw();
}

function translationDrawing(){
    //go to 0,0,-2 (init)
    translate = mat4.create();
    var vec = vec3.fromValues(0,0,-2);
    mat4.fromTranslation(translate,vec);
    gl.uniformMatrix4fv(attribTrans, false, translate);

    //Apply transform
    var vec = vec3.fromValues(document.getElementById("tx").value,document.getElementById("ty").value,document.getElementById("tz").value);
    mat4.translate(translate, translate, vec);
    gl.uniformMatrix4fv(attribTrans, false, translate);
    draw();
}

function rotationDrawing(){
    var matTemp = mat4.create();
    mat4.fromXRotation(matTemp, document.getElementById("rx").value/100);

    var matTemp1 = mat4.create();
    mat4.fromYRotation(matTemp1, document.getElementById("ry").value/100);

    var matTemp2 = mat4.create();
    mat4.fromZRotation(matTemp2, document.getElementById("rz").value/100);

    mat4.multiply(rotation, matTemp, matTemp1);
    mat4.multiply(rotation, rotation, matTemp2);

    gl.uniformMatrix4fv(attribRot, false, rotation);
    draw();
}

function main(){
    initContext();
    initShaders();
    initAttributes();
    initProject();
    initEvents();
    initBuffers();
    draw();
}
