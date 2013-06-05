/*
 * Copyright (C) 2012 ARM Inc.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 * 1. Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY UNIVERSITY OF SZEGED ``AS IS'' AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE ARE DISCLAIMED.  IN NO EVENT SHALL UNIVERSITY OF SZEGED OR
 * CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 * EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 * PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 * PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
 * OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

window.requestAnimFrame = (function () {
    return window.requestAnimationFrame ||
           window.webkitRequestAnimationFrame ||
           window.mozRequestAnimationFrame ||
           window.oRequestAnimationFrame ||
           window.msRequestAnimationFrame ||
           function (callback, element) {
               return window.setTimeout(callback, 1000 / 60);
           };
})();

window.cancelRequestAnimFrame = (function () {
    return window.cancelCancelRequestAnimationFrame ||
           window.webkitCancelRequestAnimationFrame ||
           window.mozCancelRequestAnimationFrame ||
           window.oCancelRequestAnimationFrame ||
           window.msCancelRequestAnimationFrame ||
           window.clearTimeout;
})();

function getRandom(min, max) {
    switch (arguments.length) {
        case 1: return parseInt(Math.random() * min + 1);
        case 2: return parseInt(Math.random() * (max - min + 1) + min);
        default: return 0;
    }
}

function MethanolCanvas2DTest(redraw) {
    var frameCount = 0;
    var startTime = Date.now();
    var ctx;
    var drawCtx = redraw;

    function animationFrameCallback() {
        frameCount++;
        if (frameCount > 50) {
            var message = {
                start: startTime,
                end: Date.now(),
            };
            window.parent.postMessage(JSON.stringify(message), "*");
            return;
        }
        drawCtx(ctx);
        window.requestAnimFrame(animationFrameCallback);
    }

    function startCanvasAnimation() {
        document.body.innerHTML = '<canvas id="canvas" width="800" height="600" />';
        var canvas = document.getElementById('canvas');
        ctx = canvas.getContext('2d');
        window.requestAnimFrame(animationFrameCallback);
    }

    function init() {
        if (window.addEventListener)
            window.addEventListener("load", startCanvasAnimation, false);
        else
            window.attachEvent("onload", startCanvasAnimation);
    }

    init();
}

