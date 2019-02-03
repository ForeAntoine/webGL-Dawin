attribute vec3 position;
attribute vec3 couleur;

uniform mat4 translation;
uniform mat4 projection;
uniform mat4 rotation;

varying vec3 v_color;

void main() {
    gl_Position = projection*translation*rotation*vec4(position[0], position[1], position[2], 1.0);
    v_color = couleur;
}