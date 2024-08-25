import { loadShaders, preprocessShaders } from "./ts-util/shader-utils";

export const programEntry = (screenDimension: number[], ctx: CanvasRenderingContext2D) => {  
    const initGPUCompute = async (shaders: string[]) => {
        const adapter = await navigator.gpu.requestAdapter({
            powerPreference: "high-performance"
        });
        if (!adapter) return;
        const device = await adapter.requestDevice();

        const maxUniformBufferBindingSize = device.limits.maxUniformBufferBindingSize;
        const maxStorageBufferBindingSize = device.limits.maxStorageBufferBindingSize;
        // META DATA GPU BUFFER
    
        const metaData = [
            ...screenDimension,
            1, 2, 3, 4
        ];
        const metaMatrix = new Float32Array(metaData);

        const gpuBufferFirstMatrix = device.createBuffer({
            mappedAtCreation: true,
            size: metaMatrix.byteLength,
            usage: GPUBufferUsage.STORAGE,
        });
        const arrayBufferFirstMatrix = gpuBufferFirstMatrix.getMappedRange();
        new Float32Array(arrayBufferFirstMatrix).set(metaMatrix);
        gpuBufferFirstMatrix.unmap();
    
        const resultMatrixBufferSize = 3 * Float32Array.BYTES_PER_ELEMENT * (2 + screenDimension[0] * screenDimension[1]);
        const resultMatrixBuffer = device.createBuffer({
            size: resultMatrixBufferSize,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC
        });
    

        const bindGroupLayout = device.createBindGroupLayout({
            entries: [
                {
                    binding: 0,
                    visibility: GPUShaderStage.COMPUTE,
                    buffer: {
                        type: "read-only-storage"
                    }
                },
                {
                    binding: 1,
                    visibility: GPUShaderStage.COMPUTE,
                    buffer: {
                        type: "storage"
                    }
                },
            ]
        });
    
        const bindGroup = device.createBindGroup({
            layout: bindGroupLayout,
            entries: [
                {
                    binding: 0,
                    resource: {
                        buffer: gpuBufferFirstMatrix
                    }
                },
                {
                    binding: 1,
                    resource: {
                        buffer: resultMatrixBuffer
                    }
                }
            ]
        });
    
        const shaderModule = device.createShaderModule({
            code: shaders[0]
        });
        const computePipeline = device.createComputePipeline({
            layout: device.createPipelineLayout({
                bindGroupLayouts: [bindGroupLayout]
            }),
            compute: {
                module: shaderModule,
                entryPoint: "main"
            }
        });
    
        const commandEncoder = device.createCommandEncoder();
    
        const passEncoder = commandEncoder.beginComputePass();
        passEncoder.setPipeline(computePipeline);
        passEncoder.setBindGroup(0, bindGroup);
        const workgroupCountX = Math.ceil(screenDimension[0] / 8);
        const workgroupCountY = Math.ceil(screenDimension[1] / 8);
        passEncoder.dispatchWorkgroups(workgroupCountX, workgroupCountY);
        passEncoder.end();
    
        // Get a GPU buffer for reading in an unmapped state.
        const gpuReadBuffer = device.createBuffer({
            size: resultMatrixBufferSize,
            usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ
        });
        // Encode commands for copying buffer to buffer.
        commandEncoder.copyBufferToBuffer(
            resultMatrixBuffer,
            0,
            gpuReadBuffer,
            0,
            resultMatrixBufferSize
        );
    
        // Submit GPU commands.
        const gpuCommands = commandEncoder.finish();
        device.queue.submit([gpuCommands]);
    
        // Read buffer.
        await gpuReadBuffer.mapAsync(GPUMapMode.READ);
        const arrayBuffer = gpuReadBuffer.getMappedRange();
        const outputData = new Float32Array(arrayBuffer);
    
        // draw data to canvas
        const pixelData = outputData.slice(2);
        const ctxPixelData = ctx.createImageData(screenDimension[0], screenDimension[1]);
        const p = ctxPixelData.data;
        for(let x = 0; x < screenDimension[0]; x++){
            for(let y = 0; y < screenDimension[1]; y++){
                const i = y + x * screenDimension[1];
                const i3 = i * 3;
                const i4 = i * 4;
                p[i4] = pixelData[i3] * 255;
                p[i4 + 1] = pixelData[i3 + 1] * 255;
                p[i4 + 2] = pixelData[i3 + 2] * 255;
                p[i4 + 3] = 255;
            }
        }
        ctx.putImageData(ctxPixelData, 0, 0);

        
        return true;
    }
    
    const shaderPaths = [
        '/src/program.wgsl'
    ];

    loadShaders(shaderPaths).then(shaders => {
        return preprocessShaders(shaders, shaderPaths);
    }).then(async (shaders) => {
        await initGPUCompute(shaders); 
        console.log("HI")
    });
}