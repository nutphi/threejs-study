uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;

uniform vec2 uFrequency;
uniform float uTime;
attribute vec3 position;
attribute vec2 uv;
// attribute float aRandom; // get attribute send from material attribute
varying float vuTime;
varying vec2 vUv;
varying float vElevation;
// varying float vRandom; // send vertex to fragment

void main()
{
  vec4 m = vec4(1.0, 1.0, 1.0, 3.0);
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);

  float elevation = sin(modelPosition.x * uFrequency.x - uTime) * 0.1;
  elevation += sin(modelPosition.y * uFrequency.y - uTime) * 0.1;

  modelPosition.z += elevation;

  // modelPosition.z += sin(modelPosition.x * uFrequency.x + uTime) * 0.5; // make a wave
  // modelPosition.z += sin(modelPosition.y * uFrequency.y + uTime) * 0.5; // make a wave

  // for using varying
  // modelPosition.z += aRandom;
  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectionPosition = projectionMatrix * viewPosition;
  gl_Position = projectionPosition;
  // vRandom = aRandom;
  vuTime = modelPosition.z;
  vUv = uv;
  vElevation = elevation;
}