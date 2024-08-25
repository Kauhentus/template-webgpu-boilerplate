struct MetaData {
    resolution: vec2f,
    a: f32,
    b: f32, 
    c: f32,
    d: f32
}

struct OutputData {
    size : vec2f,
    numbers: array<f32>,
}

@group(0) @binding(0) var<storage, read> metaData : MetaData;
@group(0) @binding(1) var<storage, read_write> resultMatrix : OutputData;

@compute @workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) global_id : vec3u) {
    // prepare meta variables
    let size = metaData.resolution;
    let a = metaData.a;
    let b = metaData.b;
    let c = metaData.c;
    let d = metaData.d;

    // guard against out-of-bounds work group sizes    
    if (global_id.x >= u32(size.x) || global_id.y >= u32(size.y)) { return; };

    let gx = f32(global_id.x);
    let gy = f32(global_id.y);
    let index = (global_id.x + global_id.y * u32(size.x)) * 3;

    let color = vec3(gx / size.x, gy / size.y, 0);
    resultMatrix.numbers[index] = color.x;
    resultMatrix.numbers[index + 1] = color.y;
    resultMatrix.numbers[index + 2] = color.z;
}