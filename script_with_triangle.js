const canvas = document.getElementById('myCanvas');
canvas.width = 1000;
canvas.height = 500;

const gl = canvas.getContext('webgl');

if (!gl) {
    alert('A böngésződ nem támogatja a WebGL-t.');
}

// Vertex shader for the triangle
const vertexShaderSource = `
    attribute vec2 a_position;
    void main() {
        gl_Position = vec4(a_position, 0, 1);
    }
`;

// New fragment shader with a blue gradient
const fragmentShaderSource = `
    precision mediump float;
    void main() {
        vec2 coord = gl_FragCoord.xy / vec2(1000.0, 500.0); // Normalize coordinates
        gl_FragColor = vec4(coord.x * 0.5, coord.y * 0.5, 1.0, 1.0); // Gradient in blue shades
    }
`;

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

const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);

if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
}

gl.useProgram(program);

const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
const positionBuffer = gl.createBuffer();

gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

const positions = [
    0.0, 0.5,    // Top vertex
    -0.5, -0.5,  // Bottom left vertex
    0.5, -0.5    // Bottom right vertex
];
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

gl.enableVertexAttribArray(positionAttributeLocation);
gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

function drawScene() {
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    // Draw the triangle
    gl.drawArrays(gl.TRIANGLES, 0, 3);
}

// Draw the scene once
drawScene();