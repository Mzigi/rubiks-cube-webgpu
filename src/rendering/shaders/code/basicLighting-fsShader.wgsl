@group(0) @binding(0) var gBufferNormal: texture_2d<f32>;
@group(0) @binding(1) var gBufferAlbedo: texture_2d<f32>;
@group(0) @binding(2) var gBufferDepth: texture_depth_2d;

struct LightInfo {
    dirLightVector: vec4f,
    dirLightColor: vec4f,
    ambientLightColor: vec4f,

    viewPos: vec4f,
}

@group(1) @binding(0) var<uniform> lightInfo: LightInfo;

struct Global {
    projectionMatrix: mat4x4f,
    viewMatrix: mat4x4f,
    invViewProjectionMatrix: mat4x4f,
}

@group(2) @binding(0) var<uniform> global : Global;

//directional light function
fn calculateDirLight(normal: vec3f) -> vec3f {
    var directionalLight : f32 = dot(normal, normalize(lightInfo.dirLightVector.xyz));
    var dirLight : vec3f = (lightInfo.dirLightColor.rgb * max(directionalLight, 0.0));
    return dirLight;
}

fn world_from_screen_coord(coord : vec2f, depth_sample: f32) -> vec3f {
  // reconstruct world-space position from the screen coordinate.
  let posClip = vec4(coord.x * 2.0 - 1.0, (1.0 - coord.y) * 2.0 - 1.0, depth_sample, 1.0);
  let posWorldW = global.invViewProjectionMatrix * posClip;
  let posWorld = posWorldW.xyz / posWorldW.www;
  return posWorld;
}

fn caculateSpecular(normal: vec3f, coord: vec3f) -> vec3f {
    let specularStrength : f32 = 1.0;

    let viewDir : vec3f = normalize(lightInfo.viewPos.xyz - coord);
    //let reflectDir : vec3f = reflect(-lightInfo.dirLightVector.xyz, normal);

    let halfWayDir : vec3f = normalize(lightInfo.dirLightVector.xyz + viewDir);

    let spec : f32 = pow(max(dot(normal, halfWayDir), 0.0), 128.0);
    let specular : vec3f = specularStrength * spec * lightInfo.dirLightColor.rgb;  

    return specular;
}

@fragment
fn fragmentMain(
    @builtin(position) coord : vec4f
) -> @location(0) vec4f {
    var result : vec3f;

    let normal = textureLoad(
        gBufferNormal,
        vec2i(floor(coord.xy)),
        0
    ).xyz;

    let albedo = textureLoad(
        gBufferAlbedo,
        vec2i(floor(coord.xy)),
        0
    ).rgb;

    let rawDepth = textureLoad(
      gBufferDepth,
      vec2i(floor(coord.xy)),
      0
    );

    // remap depth into something a bit more visible
    let depth = (1.0 - rawDepth) * 50.0;

    let worldPos : vec3f = world_from_screen_coord(coord.xy / vec2f(1920.0, 1080.0), rawDepth);
    result = albedo * (caculateSpecular(normal, worldPos) + calculateDirLight(normal) + lightInfo.ambientLightColor.rgb);

    return vec4(result, 1.0);
    //return vec4(result, 1.0);
}