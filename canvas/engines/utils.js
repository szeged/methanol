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

window.requestAnimFrame = (function() {
    return window.requestAnimationFrame ||
           window.webkitRequestAnimationFrame ||
           window.mozRequestAnimationFrame ||
           window.oRequestAnimationFrame ||
           window.msRequestAnimationFrame ||
           function( callback, element) {
               return window.setTimeout(callback, 1000/60);
        };
})();

window.cancelRequestAnimFrame = (function() {
    return window.cancelCancelRequestAnimationFrame ||
           window.webkitCancelRequestAnimationFrame ||
           window.mozCancelRequestAnimationFrame ||
           window.oCancelRequestAnimationFrame ||
           window.msCancelRequestAnimationFrame ||
           window.clearTimeout;
})();

function getRandom (min, max)
{ 
    switch(arguments.length){ 
        case 1: return parseInt(Math.random()*min+1); 
        case 2: return parseInt(Math.random()*(max-min+1) + min); 
        default: return 0; 
	}
}  

function FPSUtil() {
    this.start = new Date();
    this.samples = 50;
    this.curSample = 0;
    this.curFPS = 0;
    this.fpsArray = new Array(10);
    this.curElement = 0;
    for (var i = 0; i < 10; i++)
        this.fpsArray[i] = 0;
}

FPSUtil.prototype.update = function() {
    if (++this.curSample >= this.samples) {
        var curTime = new Date();
        var startTime = this.start;
        var costTime = curTime.getTime() - startTime.getTime();
        this.curFPS = (1000.0 * this.samples / costTime);
        this.curSample = 0;
        this.start = curTime;
	this.fpsArray[this.curElement] = this.curFPS;
	this.curElement = (++this.curElement) % 10;
        return true;
    }
    return false;
};

FPSUtil.prototype.getFPS = function() {
    return this.fpsArray;
};

FPSUtil.prototype.reset = function() {
    this.curSample = 0;
    this.curFPS = 0;
}


