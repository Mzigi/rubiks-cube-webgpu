@group(0) @binding(0) var gBufferNormal: texture_2d<f32>;
@group(0) @binding(1) var gBufferAlbedo: texture_2d<f32>;
@group(0) @binding(2) var gBufferDepth: texture_depth_2d;

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
    result = vec3(depth, depth, depth);

    if (coord.y / 1080 < 0.333) {
        result = normal.xyz * 0.5;
    } else if (coord.y / 1080 < 0.666) {
        result = albedo.rgb;
    } else {
        result = vec3(depth, depth, depth);
    }

    return vec4(result, 1.0);
    //return vec4(result, 1.0);
}