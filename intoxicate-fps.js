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

function methanol_fps_done()
{
    var fpsSum = 0;
    var fpsCount = 0;
    var fpsAvg = 0;
    var fpsTmp = 0;

    for (var i = 0; i < 10; i++) {
        fpsTmp = parseFloat(uploadfr[i]);
	if ( fpsTmp > 0.1) {
	    fpsSum += fpsTmp;
	    fpsCount++;
	}	
    }
    if (fpsCount != 0)
	fpsAvg = fpsSum / fpsCount;
    window.parent.postMessage(JSON.stringify(fpsAvg.toFixed(2)), "*");
}

function methanol_frame_done()
{
    setTimeout(methanol_fps_done, 15000);
}

if (window.addEventListener)
    window.addEventListener("load", methanol_frame_done, false);
else
    window.attachEvent("onload", methanol_frame_done);



	
