// === 矩阵SVG生成器（简化稳健版） ===
// 不使用 new Function，不用复杂字符串拼接
// 每道题的矩阵和选项全部硬编码预定义
const MatrixGen = {

  // 为每个格子画圆点
  _dots(n) {
    if (n <= 0) return '';
    var s = '', pos = [[35,35],[18,23],[53,23],[18,47],[53,47],[35,14],[35,56],[14,35],[56,35]];
    for (var i = 0; i < Math.min(n, 9); i++) {
      s += '<circle cx="' + pos[i][0] + '" cy="' + pos[i][1] + '" r="5" fill="#2C2C2A"/>';
    }
    return s;
  },

  // 条纹线
  _stripes(dir) {
    var s = '';
    if (dir === 'h') {
      for (var i = 1; i < 6; i++) {
        var py = Math.round(70/6*i);
        s += '<line x1="6" y1="' + py + '" x2="64" y2="' + py + '" stroke="#7EC8A0" stroke-width="1.5"/>';
      }
    } else {
      for (var i = 1; i < 6; i++) {
        var px = Math.round(70/6*i);
        s += '<line x1="' + px + '" y1="6" x2="' + px + '" y2="64" stroke="#7EC8A0" stroke-width="1.5"/>';
      }
    }
    return s;
  },

  // 主入口
  generate(idx) {
    return this.ALL[idx]();
  },

  // ====== 4道题全部硬编码 ======
  ALL: [
    // Q1: 圆点递增 (gf-01)
    function() {
      var m = '', W=70, H=70;
      var cells = [[1,2,3],[2,3,4],[3,4,null]];
      for (var r = 0; r < 3; r++) {
        for (var c = 0; c < 3; c++) {
          var x = c*(W+2), y = r*(H+2), isM = !cells[r][c];
          m += '<rect x="'+x+'" y="'+y+'" width="'+W+'" height="'+H+'" rx="4" fill="#fff" stroke="'+(isM?'#D4A843':'#D3D1C7')+'" stroke-width="'+(isM?2:1)+'"/>';
          if (isM) m += '<text x="'+(x+W/2)+'" y="'+(y+H/2+6)+'" text-anchor="middle" fill="#888" font-size="18">?</text>';
          else m += MatrixGen._dots(cells[r][c]);
        }
      }
      var matrixSVG = '<svg viewBox="0 0 216 216" width="216" height="216">'+m+'</svg>';
      var opts = MatrixGen._makeOpts([3,4,5,6,7,8], MatrixGen._dots);
      return { matrixSVG: matrixSVG, options: opts };
    },
    // Q2: 箭头旋转 (gf-02)
    function() {
      var m = '', W=70, H=70;
      var arrows = [['↑','↗','→'],['↗','→','↓'],['→','↓',null]];
      for (var r = 0; r < 3; r++) {
        for (var c = 0; c < 3; c++) {
          var x = c*(W+2), y = r*(H+2), isM = !arrows[r][c];
          m += '<rect x="'+x+'" y="'+y+'" width="'+W+'" height="'+H+'" rx="4" fill="#fff" stroke="'+(isM?'#D4A843':'#D3D1C7')+'" stroke-width="'+(isM?2:1)+'"/>';
          if (isM) m += '<text x="'+(x+W/2)+'" y="'+(y+H/2+6)+'" text-anchor="middle" fill="#888" font-size="18">?</text>';
          else m += '<text x="'+(x+W/2)+'" y="'+(y+H/2+8)+'" text-anchor="middle" fill="#2C2C2A" font-size="28">'+arrows[r][c]+'</text>';
        }
      }
      var matrixSVG = '<svg viewBox="0 0 216 216" width="216" height="216">'+m+'</svg>';
      var arrows2 = ['↑','↗','→','↓','↙','←'];
      var opts = arrows2.map(function(a){
        return '<svg viewBox="0 0 70 70" width="70" height="70"><rect x="0" y="0" width="70" height="70" rx="4" fill="#fff" stroke="#D3D1C7"/><text x="35" y="42" text-anchor="middle" fill="#2C2C2A" font-size="28">'+a+'</text></svg>';
      });
      return { matrixSVG: matrixSVG, options: opts };
    },
    // Q3: 形状渐变 (gf-03)
    function() {
      var m = '', W=70, H=70;
      var shapes = [
        [{rx:35,ln:'h'},{rx:35,ln:'v'},{rx:35,ln:'h'}],
        [{rx:10,ln:'h'},{rx:10,ln:'v'},{rx:10,ln:'h'}],
        [{rx:2,ln:'h'},{rx:2,ln:'v'},null]
      ];
      for (var r = 0; r < 3; r++) {
        for (var c = 0; c < 3; c++) {
          var x = c*(W+2), y = r*(H+2), isM = !shapes[r][c];
          m += '<rect x="'+x+'" y="'+y+'" width="'+W+'" height="'+H+'" rx="'+(isM?4:shapes[r][c].rx)+'" fill="#fff" stroke="'+(isM?'#D4A843':'#D3D1C7')+'" stroke-width="'+(isM?2:1)+'"/>';
          if (isM) m += '<text x="'+(x+W/2)+'" y="'+(y+H/2+6)+'" text-anchor="middle" fill="#888" font-size="18">?</text>';
          else m += MatrixGen._stripes(shapes[r][c].ln);
        }
      }
      var matrixSVG = '<svg viewBox="0 0 216 216" width="216" height="216">'+m+'</svg>';
      var combos = [{rx:2,ln:'v'},{rx:2,ln:'h'},{rx:35,ln:'v'},{rx:35,ln:'h'},{rx:10,ln:'v'},{rx:10,ln:'h'}];
      var opts = combos.map(function(c){
        return '<svg viewBox="0 0 70 70" width="70" height="70"><rect x="0" y="0" width="70" height="70" rx="'+c.rx+'" fill="#fff" stroke="#D3D1C7"/>'+MatrixGen._stripes(c.ln)+'</svg>';
      });
      return { matrixSVG: matrixSVG, options: opts };
    },
    // Q4: 叠加消除 (gf-04)
    function() {
      var m = '', W=70, H=70;
      // Row pattern: left-half only, right-half only, xor (left half)
      var shapes = [
        ['L','R','L'],
        ['L','R','L'],
        ['L','R',null]
      ];
      for (var r = 0; r < 3; r++) {
        for (var c = 0; c < 3; c++) {
          var x = c*(W+2), y = r*(H+2), isM = !shapes[r][c];
          m += '<rect x="'+x+'" y="'+y+'" width="'+W+'" height="'+H+'" rx="4" fill="#fff" stroke="'+(isM?'#D4A843':'#D3D1C7')+'" stroke-width="'+(isM?2:1)+'"/>';
          if (isM) m += '<text x="'+(x+W/2)+'" y="'+(y+H/2+6)+'" text-anchor="middle" fill="#888" font-size="18">?</text>';
          else {
            var s = shapes[r][c];
            if (s==='L') m += '<path d="M'+(x+W/2)+','+(y+4)+' A'+(W/2-4)+','+(H/2-4)+' 0 0,1 '+(x+W/2)+','+(y+H-4)+' Z" fill="#7EC8A0" opacity="0.6"/>';
            else m += '<path d="M'+(x+W/2)+','+(y+4)+' A'+(W/2-4)+','+(H/2-4)+' 0 0,0 '+(x+W/2)+','+(y+H-4)+' Z" fill="#E891A0" opacity="0.6"/>';
          }
        }
      }
      var matrixSVG = '<svg viewBox="0 0 216 216" width="216" height="216">'+m+'</svg>';
      var shapes2 = ['R','B','F','L','T','O']; // R=right, B=bottom, F=full, L=left, T=top, O=overlap
      var opts = shapes2.map(function(s){
        var svg = '<svg viewBox="0 0 70 70" width="70" height="70"><rect x="0" y="0" width="70" height="70" rx="4" fill="#fff" stroke="#D3D1C7"/>';
        var cx=35,cy=35,rx=31,ry=31;
        if (s==='L') svg += '<path d="M'+cx+','+(cy-ry)+' A'+rx+','+ry+' 0 0,1 '+cx+','+(cy+ry)+' Z" fill="#7EC8A0" opacity="0.6"/>';
        else if (s==='R') svg += '<path d="M'+cx+','+(cy-ry)+' A'+rx+','+ry+' 0 0,0 '+cx+','+(cy+ry)+' Z" fill="#E891A0" opacity="0.6"/>';
        else if (s==='T') svg += '<path d="M'+(cx-rx)+','+cy+' A'+rx+','+ry+' 0 0,1 '+(cx+rx)+','+cy+' Z" fill="#7EC8A0" opacity="0.6"/>';
        else if (s==='B') svg += '<path d="M'+(cx-rx)+','+cy+' A'+rx+','+ry+' 0 0,0 '+(cx+rx)+','+cy+' Z" fill="#7EC8A0" opacity="0.6"/>';
        else if (s==='F') svg += '<ellipse cx="'+cx+'" cy="'+cy+'" rx="'+rx+'" ry="'+ry+'" fill="#7EC8A0" opacity="0.6"/>';
        else if (s==='O') {
          svg += '<path d="M'+cx+','+(cy-ry)+' A'+rx+','+ry+' 0 0,1 '+cx+','+(cy+ry)+' Z" fill="#7EC8A0" opacity="0.6"/>';
          svg += '<path d="M'+cx+','+(cy-ry)+' A'+rx+','+ry+' 0 0,0 '+cx+','+(cy+ry)+' Z" fill="#E891A0" opacity="0.6"/>';
        }
        svg += '</svg>';
        return svg;
      });
      return { matrixSVG: matrixSVG, options: opts };
    }
  ],

  // 生成选项SVG的辅助函数
  _makeOpts(counts, fn) {
    return counts.map(function(n) {
      var svg = '<svg viewBox="0 0 70 70" width="70" height="70">';
      svg += '<rect x="0" y="0" width="70" height="70" rx="4" fill="#fff" stroke="#D3D1C7"/>';
      svg += fn(n);
      svg += '</svg>';
      return svg;
    });
  }
};

export default MatrixGen;
