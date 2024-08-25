/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/program.ts":
/*!************************!*\
  !*** ./src/program.ts ***!
  \************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   programEntry: () => (/* binding */ programEntry)
/* harmony export */ });
/* harmony import */ var _ts_util_shader_utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ts-util/shader-utils */ "./src/ts-util/shader-utils.ts");
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};

const programEntry = (screenDimension, ctx) => {
    const initGPUCompute = (shaders) => __awaiter(void 0, void 0, void 0, function* () {
        const adapter = yield navigator.gpu.requestAdapter({
            powerPreference: "high-performance"
        });
        if (!adapter)
            return;
        const device = yield adapter.requestDevice();
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
        commandEncoder.copyBufferToBuffer(resultMatrixBuffer, 0, gpuReadBuffer, 0, resultMatrixBufferSize);
        // Submit GPU commands.
        const gpuCommands = commandEncoder.finish();
        device.queue.submit([gpuCommands]);
        // Read buffer.
        yield gpuReadBuffer.mapAsync(GPUMapMode.READ);
        const arrayBuffer = gpuReadBuffer.getMappedRange();
        const outputData = new Float32Array(arrayBuffer);
        // draw data to canvas
        const pixelData = outputData.slice(2);
        const ctxPixelData = ctx.createImageData(screenDimension[0], screenDimension[1]);
        const p = ctxPixelData.data;
        for (let x = 0; x < screenDimension[0]; x++) {
            for (let y = 0; y < screenDimension[1]; y++) {
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
    });
    const shaderPaths = [
        '/src/program.wgsl'
    ];
    (0,_ts_util_shader_utils__WEBPACK_IMPORTED_MODULE_0__.loadShaders)(shaderPaths).then(shaders => {
        return (0,_ts_util_shader_utils__WEBPACK_IMPORTED_MODULE_0__.preprocessShaders)(shaders, shaderPaths);
    }).then((shaders) => __awaiter(void 0, void 0, void 0, function* () {
        yield initGPUCompute(shaders);
        console.log("HI");
    }));
};


/***/ }),

/***/ "./src/ts-util/shader-utils.ts":
/*!*************************************!*\
  !*** ./src/ts-util/shader-utils.ts ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   loadShaders: () => (/* binding */ loadShaders),
/* harmony export */   preprocessShaders: () => (/* binding */ preprocessShaders)
/* harmony export */ });
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const loadShaders = (shaderPaths) => {
    return Promise.all(shaderPaths.map(path => {
        return new Promise((resolve) => {
            const client = new XMLHttpRequest();
            client.open('GET', path);
            client.onload = function () {
                const shaderCode = client.responseText;
                resolve(shaderCode);
            };
            client.send();
        });
    }));
};
const preprocessShaders = (rawShaderCode, paths) => __awaiter(void 0, void 0, void 0, function* () {
    let mainProgram = rawShaderCode[0];
    let mainRoot = paths[0].split('/').slice(0, -1).join('/') + '/';
    let imported = [];
    const processFile = (rawCode, rel_path) => {
        let programLines = rawCode.split('\n').map(line => {
            if (line.includes('#include')) {
                const filename = `${rel_path}${line.slice(9).trim()}`;
                const fileIndex = paths.indexOf(filename);
                if (fileIndex === -1)
                    console.error(`#include ${filename} was not found at path`);
                if (imported.indexOf(filename) !== -1)
                    return '';
                const new_rel_path = filename.split('/').slice(0, -1).join('/') + '/';
                imported.push(filename);
                return processFile(rawShaderCode[fileIndex], new_rel_path);
            }
            else {
                return line;
            }
        });
        return programLines.join('\n');
    };
    const result = processFile(mainProgram, mainRoot);
    return [result];
});


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _program__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./program */ "./src/program.ts");

const screenDimension = [512, 512];
const mainCanvas = document.getElementById('main-canvas');
mainCanvas.width = screenDimension[0];
mainCanvas.height = screenDimension[1];
const ctx = mainCanvas.getContext('2d');
console.log("hello world");
(0,_program__WEBPACK_IMPORTED_MODULE_0__.programEntry)(screenDimension, ctx);

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUFVLENBQUMsTUFBTSxHQUFHLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUV2QyxNQUFNLEdBQUcsR0FBRyxVQUFVLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBNkIsQ0FBQztBQUVwRSxPQUFPLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0FBRTNCLHNEQUFZLENBQUMsZUFBZSxFQUFFLEdBQUcsQ0FBQyxDQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vdG95c2luYm94LWRpZmZ1c2lvbi1yZWFjdGlvbi8uL3NyYy9wcm9ncmFtLnRzIiwid2VicGFjazovL3RveXNpbmJveC1kaWZmdXNpb24tcmVhY3Rpb24vLi9zcmMvdHMtdXRpbC9zaGFkZXItdXRpbHMudHMiLCJ3ZWJwYWNrOi8vdG95c2luYm94LWRpZmZ1c2lvbi1yZWFjdGlvbi93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly90b3lzaW5ib3gtZGlmZnVzaW9uLXJlYWN0aW9uL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly90b3lzaW5ib3gtZGlmZnVzaW9uLXJlYWN0aW9uL3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vdG95c2luYm94LWRpZmZ1c2lvbi1yZWFjdGlvbi93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL3RveXNpbmJveC1kaWZmdXNpb24tcmVhY3Rpb24vLi9zcmMvaW5kZXgudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgbG9hZFNoYWRlcnMsIHByZXByb2Nlc3NTaGFkZXJzIH0gZnJvbSBcIi4vdHMtdXRpbC9zaGFkZXItdXRpbHNcIjtcclxuXHJcbmV4cG9ydCBjb25zdCBwcm9ncmFtRW50cnkgPSAoc2NyZWVuRGltZW5zaW9uOiBudW1iZXJbXSwgY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQpID0+IHsgIFxyXG4gICAgY29uc3QgaW5pdEdQVUNvbXB1dGUgPSBhc3luYyAoc2hhZGVyczogc3RyaW5nW10pID0+IHtcclxuICAgICAgICBjb25zdCBhZGFwdGVyID0gYXdhaXQgbmF2aWdhdG9yLmdwdS5yZXF1ZXN0QWRhcHRlcih7XHJcbiAgICAgICAgICAgIHBvd2VyUHJlZmVyZW5jZTogXCJoaWdoLXBlcmZvcm1hbmNlXCJcclxuICAgICAgICB9KTtcclxuICAgICAgICBpZiAoIWFkYXB0ZXIpIHJldHVybjtcclxuICAgICAgICBjb25zdCBkZXZpY2UgPSBhd2FpdCBhZGFwdGVyLnJlcXVlc3REZXZpY2UoKTtcclxuXHJcbiAgICAgICAgY29uc3QgbWF4VW5pZm9ybUJ1ZmZlckJpbmRpbmdTaXplID0gZGV2aWNlLmxpbWl0cy5tYXhVbmlmb3JtQnVmZmVyQmluZGluZ1NpemU7XHJcbiAgICAgICAgY29uc3QgbWF4U3RvcmFnZUJ1ZmZlckJpbmRpbmdTaXplID0gZGV2aWNlLmxpbWl0cy5tYXhTdG9yYWdlQnVmZmVyQmluZGluZ1NpemU7XHJcbiAgICAgICAgLy8gTUVUQSBEQVRBIEdQVSBCVUZGRVJcclxuICAgIFxyXG4gICAgICAgIGNvbnN0IG1ldGFEYXRhID0gW1xyXG4gICAgICAgICAgICAuLi5zY3JlZW5EaW1lbnNpb24sXHJcbiAgICAgICAgICAgIDEsIDIsIDMsIDRcclxuICAgICAgICBdO1xyXG4gICAgICAgIGNvbnN0IG1ldGFNYXRyaXggPSBuZXcgRmxvYXQzMkFycmF5KG1ldGFEYXRhKTtcclxuXHJcbiAgICAgICAgY29uc3QgZ3B1QnVmZmVyRmlyc3RNYXRyaXggPSBkZXZpY2UuY3JlYXRlQnVmZmVyKHtcclxuICAgICAgICAgICAgbWFwcGVkQXRDcmVhdGlvbjogdHJ1ZSxcclxuICAgICAgICAgICAgc2l6ZTogbWV0YU1hdHJpeC5ieXRlTGVuZ3RoLFxyXG4gICAgICAgICAgICB1c2FnZTogR1BVQnVmZmVyVXNhZ2UuU1RPUkFHRSxcclxuICAgICAgICB9KTtcclxuICAgICAgICBjb25zdCBhcnJheUJ1ZmZlckZpcnN0TWF0cml4ID0gZ3B1QnVmZmVyRmlyc3RNYXRyaXguZ2V0TWFwcGVkUmFuZ2UoKTtcclxuICAgICAgICBuZXcgRmxvYXQzMkFycmF5KGFycmF5QnVmZmVyRmlyc3RNYXRyaXgpLnNldChtZXRhTWF0cml4KTtcclxuICAgICAgICBncHVCdWZmZXJGaXJzdE1hdHJpeC51bm1hcCgpO1xyXG4gICAgXHJcbiAgICAgICAgY29uc3QgcmVzdWx0TWF0cml4QnVmZmVyU2l6ZSA9IDMgKiBGbG9hdDMyQXJyYXkuQllURVNfUEVSX0VMRU1FTlQgKiAoMiArIHNjcmVlbkRpbWVuc2lvblswXSAqIHNjcmVlbkRpbWVuc2lvblsxXSk7XHJcbiAgICAgICAgY29uc3QgcmVzdWx0TWF0cml4QnVmZmVyID0gZGV2aWNlLmNyZWF0ZUJ1ZmZlcih7XHJcbiAgICAgICAgICAgIHNpemU6IHJlc3VsdE1hdHJpeEJ1ZmZlclNpemUsXHJcbiAgICAgICAgICAgIHVzYWdlOiBHUFVCdWZmZXJVc2FnZS5TVE9SQUdFIHwgR1BVQnVmZmVyVXNhZ2UuQ09QWV9TUkNcclxuICAgICAgICB9KTtcclxuICAgIFxyXG5cclxuICAgICAgICBjb25zdCBiaW5kR3JvdXBMYXlvdXQgPSBkZXZpY2UuY3JlYXRlQmluZEdyb3VwTGF5b3V0KHtcclxuICAgICAgICAgICAgZW50cmllczogW1xyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGJpbmRpbmc6IDAsXHJcbiAgICAgICAgICAgICAgICAgICAgdmlzaWJpbGl0eTogR1BVU2hhZGVyU3RhZ2UuQ09NUFVURSxcclxuICAgICAgICAgICAgICAgICAgICBidWZmZXI6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJyZWFkLW9ubHktc3RvcmFnZVwiXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBiaW5kaW5nOiAxLFxyXG4gICAgICAgICAgICAgICAgICAgIHZpc2liaWxpdHk6IEdQVVNoYWRlclN0YWdlLkNPTVBVVEUsXHJcbiAgICAgICAgICAgICAgICAgICAgYnVmZmVyOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IFwic3RvcmFnZVwiXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgXVxyXG4gICAgICAgIH0pO1xyXG4gICAgXHJcbiAgICAgICAgY29uc3QgYmluZEdyb3VwID0gZGV2aWNlLmNyZWF0ZUJpbmRHcm91cCh7XHJcbiAgICAgICAgICAgIGxheW91dDogYmluZEdyb3VwTGF5b3V0LFxyXG4gICAgICAgICAgICBlbnRyaWVzOiBbXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgYmluZGluZzogMCxcclxuICAgICAgICAgICAgICAgICAgICByZXNvdXJjZToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBidWZmZXI6IGdwdUJ1ZmZlckZpcnN0TWF0cml4XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBiaW5kaW5nOiAxLFxyXG4gICAgICAgICAgICAgICAgICAgIHJlc291cmNlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ1ZmZlcjogcmVzdWx0TWF0cml4QnVmZmVyXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgfSk7XHJcbiAgICBcclxuICAgICAgICBjb25zdCBzaGFkZXJNb2R1bGUgPSBkZXZpY2UuY3JlYXRlU2hhZGVyTW9kdWxlKHtcclxuICAgICAgICAgICAgY29kZTogc2hhZGVyc1swXVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGNvbnN0IGNvbXB1dGVQaXBlbGluZSA9IGRldmljZS5jcmVhdGVDb21wdXRlUGlwZWxpbmUoe1xyXG4gICAgICAgICAgICBsYXlvdXQ6IGRldmljZS5jcmVhdGVQaXBlbGluZUxheW91dCh7XHJcbiAgICAgICAgICAgICAgICBiaW5kR3JvdXBMYXlvdXRzOiBbYmluZEdyb3VwTGF5b3V0XVxyXG4gICAgICAgICAgICB9KSxcclxuICAgICAgICAgICAgY29tcHV0ZToge1xyXG4gICAgICAgICAgICAgICAgbW9kdWxlOiBzaGFkZXJNb2R1bGUsXHJcbiAgICAgICAgICAgICAgICBlbnRyeVBvaW50OiBcIm1haW5cIlxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICBcclxuICAgICAgICBjb25zdCBjb21tYW5kRW5jb2RlciA9IGRldmljZS5jcmVhdGVDb21tYW5kRW5jb2RlcigpO1xyXG4gICAgXHJcbiAgICAgICAgY29uc3QgcGFzc0VuY29kZXIgPSBjb21tYW5kRW5jb2Rlci5iZWdpbkNvbXB1dGVQYXNzKCk7XHJcbiAgICAgICAgcGFzc0VuY29kZXIuc2V0UGlwZWxpbmUoY29tcHV0ZVBpcGVsaW5lKTtcclxuICAgICAgICBwYXNzRW5jb2Rlci5zZXRCaW5kR3JvdXAoMCwgYmluZEdyb3VwKTtcclxuICAgICAgICBjb25zdCB3b3JrZ3JvdXBDb3VudFggPSBNYXRoLmNlaWwoc2NyZWVuRGltZW5zaW9uWzBdIC8gOCk7XHJcbiAgICAgICAgY29uc3Qgd29ya2dyb3VwQ291bnRZID0gTWF0aC5jZWlsKHNjcmVlbkRpbWVuc2lvblsxXSAvIDgpO1xyXG4gICAgICAgIHBhc3NFbmNvZGVyLmRpc3BhdGNoV29ya2dyb3Vwcyh3b3JrZ3JvdXBDb3VudFgsIHdvcmtncm91cENvdW50WSk7XHJcbiAgICAgICAgcGFzc0VuY29kZXIuZW5kKCk7XHJcbiAgICBcclxuICAgICAgICAvLyBHZXQgYSBHUFUgYnVmZmVyIGZvciByZWFkaW5nIGluIGFuIHVubWFwcGVkIHN0YXRlLlxyXG4gICAgICAgIGNvbnN0IGdwdVJlYWRCdWZmZXIgPSBkZXZpY2UuY3JlYXRlQnVmZmVyKHtcclxuICAgICAgICAgICAgc2l6ZTogcmVzdWx0TWF0cml4QnVmZmVyU2l6ZSxcclxuICAgICAgICAgICAgdXNhZ2U6IEdQVUJ1ZmZlclVzYWdlLkNPUFlfRFNUIHwgR1BVQnVmZmVyVXNhZ2UuTUFQX1JFQURcclxuICAgICAgICB9KTtcclxuICAgICAgICAvLyBFbmNvZGUgY29tbWFuZHMgZm9yIGNvcHlpbmcgYnVmZmVyIHRvIGJ1ZmZlci5cclxuICAgICAgICBjb21tYW5kRW5jb2Rlci5jb3B5QnVmZmVyVG9CdWZmZXIoXHJcbiAgICAgICAgICAgIHJlc3VsdE1hdHJpeEJ1ZmZlcixcclxuICAgICAgICAgICAgMCxcclxuICAgICAgICAgICAgZ3B1UmVhZEJ1ZmZlcixcclxuICAgICAgICAgICAgMCxcclxuICAgICAgICAgICAgcmVzdWx0TWF0cml4QnVmZmVyU2l6ZVxyXG4gICAgICAgICk7XHJcbiAgICBcclxuICAgICAgICAvLyBTdWJtaXQgR1BVIGNvbW1hbmRzLlxyXG4gICAgICAgIGNvbnN0IGdwdUNvbW1hbmRzID0gY29tbWFuZEVuY29kZXIuZmluaXNoKCk7XHJcbiAgICAgICAgZGV2aWNlLnF1ZXVlLnN1Ym1pdChbZ3B1Q29tbWFuZHNdKTtcclxuICAgIFxyXG4gICAgICAgIC8vIFJlYWQgYnVmZmVyLlxyXG4gICAgICAgIGF3YWl0IGdwdVJlYWRCdWZmZXIubWFwQXN5bmMoR1BVTWFwTW9kZS5SRUFEKTtcclxuICAgICAgICBjb25zdCBhcnJheUJ1ZmZlciA9IGdwdVJlYWRCdWZmZXIuZ2V0TWFwcGVkUmFuZ2UoKTtcclxuICAgICAgICBjb25zdCBvdXRwdXREYXRhID0gbmV3IEZsb2F0MzJBcnJheShhcnJheUJ1ZmZlcik7XHJcbiAgICBcclxuICAgICAgICAvLyBkcmF3IGRhdGEgdG8gY2FudmFzXHJcbiAgICAgICAgY29uc3QgcGl4ZWxEYXRhID0gb3V0cHV0RGF0YS5zbGljZSgyKTtcclxuICAgICAgICBjb25zdCBjdHhQaXhlbERhdGEgPSBjdHguY3JlYXRlSW1hZ2VEYXRhKHNjcmVlbkRpbWVuc2lvblswXSwgc2NyZWVuRGltZW5zaW9uWzFdKTtcclxuICAgICAgICBjb25zdCBwID0gY3R4UGl4ZWxEYXRhLmRhdGE7XHJcbiAgICAgICAgZm9yKGxldCB4ID0gMDsgeCA8IHNjcmVlbkRpbWVuc2lvblswXTsgeCsrKXtcclxuICAgICAgICAgICAgZm9yKGxldCB5ID0gMDsgeSA8IHNjcmVlbkRpbWVuc2lvblsxXTsgeSsrKXtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGkgPSB5ICsgeCAqIHNjcmVlbkRpbWVuc2lvblsxXTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGkzID0gaSAqIDM7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBpNCA9IGkgKiA0O1xyXG4gICAgICAgICAgICAgICAgcFtpNF0gPSBwaXhlbERhdGFbaTNdICogMjU1O1xyXG4gICAgICAgICAgICAgICAgcFtpNCArIDFdID0gcGl4ZWxEYXRhW2kzICsgMV0gKiAyNTU7XHJcbiAgICAgICAgICAgICAgICBwW2k0ICsgMl0gPSBwaXhlbERhdGFbaTMgKyAyXSAqIDI1NTtcclxuICAgICAgICAgICAgICAgIHBbaTQgKyAzXSA9IDI1NTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBjdHgucHV0SW1hZ2VEYXRhKGN0eFBpeGVsRGF0YSwgMCwgMCk7XHJcblxyXG4gICAgICAgIFxyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBjb25zdCBzaGFkZXJQYXRocyA9IFtcclxuICAgICAgICAnL3NyYy9wcm9ncmFtLndnc2wnXHJcbiAgICBdO1xyXG5cclxuICAgIGxvYWRTaGFkZXJzKHNoYWRlclBhdGhzKS50aGVuKHNoYWRlcnMgPT4ge1xyXG4gICAgICAgIHJldHVybiBwcmVwcm9jZXNzU2hhZGVycyhzaGFkZXJzLCBzaGFkZXJQYXRocyk7XHJcbiAgICB9KS50aGVuKGFzeW5jIChzaGFkZXJzKSA9PiB7XHJcbiAgICAgICAgYXdhaXQgaW5pdEdQVUNvbXB1dGUoc2hhZGVycyk7IFxyXG4gICAgICAgIGNvbnNvbGUubG9nKFwiSElcIilcclxuICAgIH0pO1xyXG59IiwiZXhwb3J0IGNvbnN0IGxvYWRTaGFkZXJzID0gKHNoYWRlclBhdGhzOiBzdHJpbmdbXSkgPT4ge1xyXG4gICAgcmV0dXJuIFByb21pc2UuYWxsKHNoYWRlclBhdGhzLm1hcChwYXRoID0+IHtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2U8c3RyaW5nPigocmVzb2x2ZSkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBjbGllbnQgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcclxuICAgICAgICAgICAgY2xpZW50Lm9wZW4oJ0dFVCcsIHBhdGgpO1xyXG4gICAgICAgICAgICBjbGllbnQub25sb2FkID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBzaGFkZXJDb2RlID0gY2xpZW50LnJlc3BvbnNlVGV4dDtcclxuICAgICAgICAgICAgICAgIHJlc29sdmUoc2hhZGVyQ29kZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2xpZW50LnNlbmQoKTtcclxuICAgICAgICB9KTtcclxuICAgIH0pKTtcclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IHByZXByb2Nlc3NTaGFkZXJzID0gYXN5bmMgKHJhd1NoYWRlckNvZGU6IHN0cmluZ1tdLCBwYXRoczogc3RyaW5nW10pID0+IHtcclxuICAgIGxldCBtYWluUHJvZ3JhbSA9IHJhd1NoYWRlckNvZGVbMF07XHJcbiAgICBsZXQgbWFpblJvb3QgPSBwYXRoc1swXS5zcGxpdCgnLycpLnNsaWNlKDAsIC0xKS5qb2luKCcvJykgKyAnLyc7XHJcbiAgICBsZXQgaW1wb3J0ZWQ6IHN0cmluZ1tdID0gW107XHJcblxyXG4gICAgY29uc3QgcHJvY2Vzc0ZpbGUgPSAocmF3Q29kZTogc3RyaW5nLCByZWxfcGF0aDogc3RyaW5nKSA9PiB7XHJcbiAgICAgICAgbGV0IHByb2dyYW1MaW5lczogc3RyaW5nW10gPSByYXdDb2RlLnNwbGl0KCdcXG4nKS5tYXAobGluZSA9PiB7XHJcbiAgICAgICAgICAgIGlmKGxpbmUuaW5jbHVkZXMoJyNpbmNsdWRlJykpe1xyXG4gICAgICAgICAgICAgICAgY29uc3QgZmlsZW5hbWUgPSBgJHtyZWxfcGF0aH0ke2xpbmUuc2xpY2UoOSkudHJpbSgpfWA7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBmaWxlSW5kZXggPSBwYXRocy5pbmRleE9mKGZpbGVuYW1lKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZihmaWxlSW5kZXggPT09IC0xKSBjb25zb2xlLmVycm9yKGAjaW5jbHVkZSAke2ZpbGVuYW1lfSB3YXMgbm90IGZvdW5kIGF0IHBhdGhgKTtcclxuICAgICAgICAgICAgICAgIGlmKGltcG9ydGVkLmluZGV4T2YoZmlsZW5hbWUpICE9PSAtMSkgcmV0dXJuICcnO1xyXG5cclxuICAgICAgICAgICAgICAgIGNvbnN0IG5ld19yZWxfcGF0aCA9IGZpbGVuYW1lLnNwbGl0KCcvJykuc2xpY2UoMCwgLTEpLmpvaW4oJy8nKSArICcvJztcclxuICAgICAgICAgICAgICAgIGltcG9ydGVkLnB1c2goZmlsZW5hbWUpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHByb2Nlc3NGaWxlKHJhd1NoYWRlckNvZGVbZmlsZUluZGV4XSwgbmV3X3JlbF9wYXRoKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBsaW5lO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiBwcm9ncmFtTGluZXMuam9pbignXFxuJyk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgcmVzdWx0ID0gcHJvY2Vzc0ZpbGUobWFpblByb2dyYW0sIG1haW5Sb290KTtcclxuICAgIHJldHVybiBbcmVzdWx0XTtcclxufVxyXG5cclxuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCJpbXBvcnQgeyBwcm9ncmFtRW50cnkgfSBmcm9tIFwiLi9wcm9ncmFtXCI7XHJcblxyXG5jb25zdCBzY3JlZW5EaW1lbnNpb24gPSBbNTEyLCA1MTJdO1xyXG5jb25zdCBtYWluQ2FudmFzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21haW4tY2FudmFzJykgYXMgSFRNTENhbnZhc0VsZW1lbnQ7XHJcbm1haW5DYW52YXMud2lkdGggPSBzY3JlZW5EaW1lbnNpb25bMF07XHJcbm1haW5DYW52YXMuaGVpZ2h0ID0gc2NyZWVuRGltZW5zaW9uWzFdO1xyXG5cclxuY29uc3QgY3R4ID0gbWFpbkNhbnZhcy5nZXRDb250ZXh0KCcyZCcpIGFzIENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRDtcclxuXHJcbmNvbnNvbGUubG9nKFwiaGVsbG8gd29ybGRcIik7XHJcblxyXG5wcm9ncmFtRW50cnkoc2NyZWVuRGltZW5zaW9uLCBjdHgpOyJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==