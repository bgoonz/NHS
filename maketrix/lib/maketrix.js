// returns a CSS string for matrix3D 

var $M = require('../sylvester/lib/node-sylvester').$M;
window.myth = require('../sylvester/lib/node-sylvester');
var deg2rad = Math.PI / 180;

module.exports = generateMatrix;

function generateMatrix(rotateX, rotateY, rotateZ, tx, ty, translateZ, scale){
    var rotationXMatrix, rotationYMatrix, rotationZMatrix, s, scaleMatrix, transformationMatrix, translationMatrix;
    rotationXMatrix = $M([[1, 0, 0, 0], [0, Math.cos(rotateX * deg2rad), Math.sin(-rotateX * deg2rad), 0], [0, Math.sin(rotateX * deg2rad), Math.cos(rotateX * deg2rad), 0], [0, 0, 0, 1]]);
    rotationYMatrix = $M([[Math.cos(rotateY * deg2rad), 0, Math.sin(rotateY * deg2rad), 0], [0, 1, 0, 0], [Math.sin(-rotateY * deg2rad), 0, Math.cos(rotateY * deg2rad), 0], [0, 0, 0, 1]]);
    rotationZMatrix = $M([[Math.cos(rotateZ * deg2rad), Math.sin(-rotateZ * deg2rad), 0, 0], [Math.sin(rotateZ * deg2rad), Math.cos(rotateZ * deg2rad), 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]]);
    scaleMatrix = $M([[scale, 0, 0, 0], [0, scale, 0, 0], [0, 0, scale, 0], [0, 0, 0, 1]]);
    translationMatrix = $M([[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0],[tx, ty, translateZ, 1]]);
 //   translationMatrix = $M([[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [Math.sin(rotateX * deg2rad) * 250 + 250, Math.sin(rotateY * deg2rad) * 150 + 150, 0, 1]]);
    transformationMatrix = rotationXMatrix.x(rotationYMatrix).x(rotationZMatrix).x(scaleMatrix).x(translationMatrix);
    s = "matrix3d(";
    s += transformationMatrix.e(1, 1).toFixed(10) + "," + transformationMatrix.e(1, 2).toFixed(10) + "," + transformationMatrix.e(1, 3) + "," + transformationMatrix.e(1, 4).toFixed(10) + ",";
    s += transformationMatrix.e(2, 1).toFixed(10) + "," + transformationMatrix.e(2, 2).toFixed(10) + "," + transformationMatrix.e(2, 3) + "," + transformationMatrix.e(2, 4).toFixed(10) + ",";
    s += transformationMatrix.e(3, 1).toFixed(10) + "," + transformationMatrix.e(3, 2).toFixed(10) + "," + transformationMatrix.e(3, 3) + "," + transformationMatrix.e(3, 4).toFixed(10) + ",";
    s += transformationMatrix.e(4, 1).toFixed(10) + "," + transformationMatrix.e(4, 2).toFixed(10) + "," + transformationMatrix.e(4, 3) + "," + transformationMatrix.e(4, 4).toFixed(10);
    s += ")";
    return s	
}
