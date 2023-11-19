const vertexShader: string = `
// vertexShader.glsl
uniform float time;
uniform float amplitude;
uniform float wavelength;

void main() {
    vec3 transformed = position;
    transformed.y += sin(transformed.x * 2.0 * 3.14159 / wavelength + time) * amplitude;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
}`;

export { vertexShader };