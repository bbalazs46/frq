const canvas = document.getElementById('myCanvas');
canvas.width = 1000;
canvas.height = 500;

const gl = canvas.getContext('webgl');

if (!gl) {
    alert('A böngésződ nem támogatja a WebGL-t.');
}

// Vertex shader (common for both background and triangle)
const vertexShaderSource = `
    attribute vec2 a_position;
    void main() {
        gl_Position = vec4(a_position, 0, 1);
    }
`;

// Fragment shader for the background
const fragmentShaderBackgroundSource = `
    precision mediump float;
    void main() {
        vec2 coord = gl_FragCoord.xy;
        float side = 100.0;
        vec2 inCoo;
        inCoo.x = mod(coord.x + ((coord.y - mod(coord.y, side)) * 0.5), side) / side - .5;
        inCoo.y = mod(coord.y, side) / side - .5;
        float dist = pow((pow(inCoo.x, 2.0) + pow(inCoo.y, 2.0)), .5);
        float radius_1 = 0.3;
        float radius_2 = 0.3 + 1.0 / side;
        vec4 color1 = vec4(.8, .8, .8, 1.);
        vec4 color2 = vec4(1., 1., 1., 1.);
        gl_FragColor = mix(color1, color2, dist < radius_1 ? 1.0 : (dist < radius_2 ? 1.0 - (dist - radius_1) / (radius_2 - radius_1) : 0.0));
    }
`;

// Fragment shader for the triangle
const fragmentShaderTriangleSource = `
    precision mediump float;
    void main() {
        vec2 coord = gl_FragCoord.xy / vec2(1000.0, 500.0);
        gl_FragColor = vec4(coord.x * 0.5, coord.y * 0.5, 1.0, 1.0); // Gradient in blue shades
    }
`;

// Helper functions to create shaders and programs
function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

function createProgram(gl, vertexShader, fragmentShader) {
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error(gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        return null;
    }
    return program;
}

// Create shaders for background
const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
const fragmentShaderBackground = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderBackgroundSource);
const programBackground = createProgram(gl, vertexShader, fragmentShaderBackground);

// Create shaders for triangle
const fragmentShaderTriangle = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderTriangleSource);
const programTriangle = createProgram(gl, vertexShader, fragmentShaderTriangle);

// Buffer data for background (full canvas quad)
const backgroundPositionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, backgroundPositionBuffer);
const backgroundPositions = [
    -1.0, -1.0,
     1.0, -1.0,
    -1.0,  1.0,
     1.0,  1.0,
];
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(backgroundPositions), gl.STATIC_DRAW);

// Buffer data for triangle
const trianglePositionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, trianglePositionBuffer);
const trianglePositions = [
    0.0, 0.5,    // Top vertex
   -0.5, -0.5,  // Bottom left vertex
    0.5, -0.5   // Bottom right vertex
];
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(trianglePositions), gl.STATIC_DRAW);

function drawScene() {
    // Draw background
    gl.useProgram(programBackground);
    gl.bindBuffer(gl.ARRAY_BUFFER, backgroundPositionBuffer);
    const bgPositionAttributeLocation = gl.getAttribLocation(programBackground, 'a_position');
    gl.enableVertexAttribArray(bgPositionAttributeLocation);
    gl.vertexAttribPointer(bgPositionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    // Draw triangle
    gl.useProgram(programTriangle);
    gl.bindBuffer(gl.ARRAY_BUFFER, trianglePositionBuffer);
    const trianglePositionAttributeLocation = gl.getAttribLocation(programTriangle, 'a_position');
    gl.enableVertexAttribArray(trianglePositionAttributeLocation);
    gl.vertexAttribPointer(trianglePositionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.TRIANGLES, 0, 3);
}

// Draw the scene
drawScene();