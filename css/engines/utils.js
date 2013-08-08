/*
 * Copyright (C) 2012-2013 ARM Limited
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
 * THIS SOFTWARE IS PROVIDED BY UNIVERSITY OF SZEGED AND CONTRIBUTORS
 * ``AS IS'' AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL UNIVERSITY OF
 * SZEGED OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
 * TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
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

function CSSEffectTest(draw, reset) {
    var frameCount = 0;
    var startTime = Date.now();
    var drawFrame = typeof (draw) == "function" ? draw : function () { };
    var resetFrame = typeof (reset) == "function" ? reset : function () {
        document.body.innerHTML = "";
    };

    function animationFrameCallback() {
        frameCount++;
        if (frameCount > 10) {
            var message = {
                start: startTime,
                end: Date.now(),
            };
            window.parent.postMessage(JSON.stringify(message), "*");
            return;
        }

        resetFrame();
        drawFrame();
        window.requestAnimFrame(animationFrameCallback);
    }

    function startAnimation() {
        window.requestAnimFrame(animationFrameCallback);
    }

    function init() {
        if (window.addEventListener)
            window.addEventListener("load", startAnimation, false);
        else
            window.attachEvent("onload", startAnimation);
    }

    init();
}

