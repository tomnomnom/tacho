function tacho(elem, config){

    // Settings
    var max             = config.max || 100;
    var markInterval    = config.markInterval || 10;
    var bigMarkInterval = config.bigMarkInterval || 50;
    var redLinePoint    = config.redLinePoint || 0.825;
    var title           = config.title || 'Title';
    var autoScale       = config.autoScale || false;
    var font            = 'sans-serif'

    // Derived and starting values
    var width = elem.width;
    var height = elem.height;
    var radius = (width/2) - 5;
    var minRad = Math.PI * 0.25;
    var maxRad = Math.PI * 1.75;
    var scaleRads = maxRad - minRad;
    var curVal = 0;
    var maxSeen = 0;

    //var logo = new Image();
    //logo.src = '/logo.png';

    // Canvas starting state
    var c = elem.getContext('2d');
    c.translate(width/2, height/2);
    c.font = 'small-caps ' + Math.floor(radius*0.1) + 'px ' + font;

    // Main draw loop
    var draw = function(){

        var targetVal = parseInt(elem.dataset.val, 10);
        if (targetVal > maxSeen){
            maxSeen = targetVal;
        }
        
        // Value comes from the data-val attribute on the canvas element
        if (autoScale && targetVal > max){
            max = max * 2;
            markInterval = markInterval * 2;
            bigMarkInterval = bigMarkInterval * 2;
        }

        // Approach the target val by 5% of the difference per frame
        if (curVal < targetVal){
            curVal += (targetVal - curVal) / 20;
        } else {
            curVal -= (curVal - targetVal) / 20;
        }

        // Calculate the current pointer position in radians
        var curPos = ((curVal / max) * scaleRads) + minRad;

        // Draw everything
        drawOuterRim(c);
        drawMarkings(c);
        //drawLogo(c);
        drawPointer(c, curPos);
        drawMaxSeen(c, maxSeen);
        drawCenterCap(c);
        drawTitle(c);
        drawGlass(c);

        // Next frame
        requestAnimationFrame(draw);
    };

    function drawOuterRim(c){
        c.save();
        c.beginPath();
        c.arc(0, 0, radius, 0, 2 * Math.PI); // x, y, r, start, end
        c.closePath();

        var grd = c.createRadialGradient(0, 0, radius*0.95, 0, 0, radius);
        grd.addColorStop(0, "rgb(60,60,60)");
        grd.addColorStop(0.1, "rgb(10,10,10)");
        grd.addColorStop(0.5, "rgb(200,200,200)");
        grd.addColorStop(1, "rgb(100,100,100)");
        c.fillStyle = grd;
        c.fill();
        c.restore();
    }

    function drawMarkings(c){
        for (var i = 0; i <= max; i += markInterval){
            c.save();

            var pos = ((i / max) * scaleRads) + minRad;
            c.rotate(pos);
            c.beginPath();  

            if (i > max * redLinePoint){
                // REDLINE YO
                c.strokeStyle = 'rgb(240,0,0)';
                c.fillStyle = 'rgb(240,0,0)';
            } else {
                c.strokeStyle = 'rgb(255,255,255)';
                c.fillStyle = 'rgb(255,255,255)';
            }
            
            // Bigger markings and text every 50
            if (!(i % bigMarkInterval)){

                // Add text
                c.save();
                    c.translate(0, radius * 0.75);
                    c.rotate(Math.PI);
                    c.textAlign = 'center';
                    c.fillText(i, 0, radius * 0.1);
                c.restore();

                c.moveTo(0, radius * 0.75);
            } else {
                c.moveTo(0, radius * 0.85);
            }

            c.lineCap =  'square';
            c.lineWidth = 3;
            c.lineTo(0, radius * 0.9);
            c.stroke();

            c.restore();
        }
    }

    function drawLogo(c){
        // Logo (Original 760x217)
        var reduction = radius / 1000;
        c.save();
        c.globalAlpha = 0.6;
        c.drawImage(logo, -((760/2)*reduction), -(radius * 0.4), 760*reduction, 217*reduction);
        c.restore();
    }

    function drawPointer(c, curPos){
        // Pointer
        c.save();
        c.rotate(curPos);
        c.beginPath();
        c.moveTo(0, 0);
        c.lineTo(-radius * 0.02,0);

        c.lineTo(-radius * 0.01, radius * 0.75);
        c.lineTo(0, radius * 0.8);
        c.lineTo(radius * 0.01, radius * 0.75);

        c.lineTo(radius * 0.02, 0);
        c.lineTo(0, 0);
        c.closePath();

        c.shadowBlur = radius * 0.03;
        c.shadowColor = "rgb(30,30,30)";

        var grd = c.createLinearGradient(-radius*0.02, 0, radius*0.02, 0)

        grd.addColorStop(0.2, "rgb(189,98,8)");
        grd.addColorStop(0.5, "rgb(255,153,51)");
        grd.addColorStop(0.8, "rgb(189,98,8)");
        c.fillStyle = grd;
        c.fill();

        //c.lineCap = 'round';
        //c.lineWidth = 5;
        //c.strokeStyle = 'rgb(255,153,51)';
        //c.lineTo(0, radius * 0.8);
        //c.stroke();
        c.restore();
    }

    function drawMaxSeen(c, val){
        // Don't display if past the max line
        if (val > max){
            return;
        }
        var pos = ((val / max) * scaleRads) + minRad;

        c.save();

        c.rotate(pos);
        c.beginPath();
        c.moveTo(0, radius * 0.88);

        var grd = c.createLinearGradient(-radius*0.05, 0, radius*0.05, 0)
        grd.addColorStop(0.1, "rgb(189,98,8)");
        grd.addColorStop(0.5, "rgb(255,153,51)");
        grd.addColorStop(0.9, "rgb(189,98,8)");
        c.fillStyle = grd;

        c.shadowBlur = radius * 0.03;
        c.shadowColor = "rgb(30,30,30)";

        c.lineTo(-(radius*0.05), radius * 0.95);
        c.lineTo(radius*0.05, radius * 0.95);
        c.lineTo(0, radius * 0.88);
        c.fill();
        
        c.restore();
    }

    function drawCenterCap(c){
        // Center cap
        c.save();
        c.beginPath();
        c.arc(0, 0, radius * 0.08, 0, 2 * Math.PI);
        c.closePath();

        var grd = c.createRadialGradient(0, 0, 0, 0, 0, radius*0.08);
        grd.addColorStop(0, "rgb(40,40,40)");
        grd.addColorStop(0.8, "rgb(10,10,10)");

        c.fillStyle = grd;
        c.fill();
        c.restore();
    }

    function drawTitle(c){
        // Title
        c.save();
        c.strokeStyle = 'rgb(250,250,250)';
        c.fillStyle = 'rgb(250,250,250)';
        c.textAlign = 'center';
        c.fillText(title, 0, radius * 0.75);
        c.restore();
    }

    function drawGlass(c){
        c.save();
        c.beginPath();
        c.arc(0, 0, radius*0.95, 0, 2 * Math.PI); // x, y, r, start, end
        c.closePath();

        var grd = c.createRadialGradient(0, 0, 0, 0, 0, radius*0.95);
        grd.addColorStop(0, "rgba(200,200,200,0.1)");
        grd.addColorStop(0.5, "rgba(20,20,20,0.01)");
        grd.addColorStop(1, "rgba(10,10,10,0.35)");
        c.fillStyle = grd;
        c.fill();
        c.restore();
    }

    // Trigger the animation
    draw();
}

