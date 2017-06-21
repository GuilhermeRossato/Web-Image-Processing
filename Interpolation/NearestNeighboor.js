const NearestNeighboor = new ZoomMethod({
	process: function(origin, target) {
		/* Cria funções de apoio baseado no tamanho das imagens */
		var translateToOrigin = this.generateTranslateToOrigin(origin, target);
		var getNearestPixel = this.generateNearest(origin, target);
		/* Declara variaveis que serão utilizadas no loop */
		var ox, oy, rx, ry, r, g, b, a;
		/* Faz uma iteração para cada pixel do novo tamanho */
		for (var y = 0; y < target.height; y++) {
			for (var x = 0; x < target.width; x++) {
				/* Descobre onde o pixel atual está na origem */
				[ ox , oy ] = translateToOrigin(x, y);
				/* Pega o pixel mais próximo deste ponto */
				[ rx , ry ] = getNearestPixel(ox, oy);
				/* Pega o valor deste pixel na origem */
				[ r , g , b , a ] = origin.get(rx, ry);
				/* Seta o valor na nova imagem */
				target.set(x, y, r, g, b, a);
			}
		}
	},
	generateTranslateToOrigin: function(originSize, targetSize) {
		var linearInterpolation = function(x0, y0, x1, y1, x) {
			return (x * y0 - x1 * y0 - x * y1 + x0 * y1) / (x0 - x1);
		};
		return function(x, y) {
			var newX = x*originSize.width/targetSize.width;
			var newY = y*originSize.height/targetSize.height;
			return [newX, newY];
		}
	},
	generateNearest: function(originSize, targetSize) {
		function distanceSquared(x0, y0, x1, y1) {
			return (x0 - x1) * (x0 - x1) + (y0 - y1) * (y0 - y1);
		}
		return function(x, y) {
			/* Pega as distancias dos 4 pixeis adjacentes */
			var pixels = [distanceSquared(x, y, Math.floor(x), Math.floor(y)), distanceSquared(x, y, Math.ceil(x), Math.floor(y)), distanceSquared(x, y, Math.floor(x), Math.ceil(y)), distanceSquared(x, y, Math.ceil(x), Math.ceil(y))];
			/* Encontra pixel mais próximo do parametro */
			var smallest = 0;
			for (var i = 1; i < pixels.length; i++) {
				if (pixels[smallest] > pixels[i]) {
					smallest = i;
				}
			}
			/* Retorna a posição deste pixel */
			if (smallest == 0) {
				return [Math.floor(x), Math.floor(y)];
			} else if (smallest == 1) {
				return [Math.ceil(x), Math.floor(y)];
			} else if (smallest == 2) {
				return [Math.floor(x), Math.ceil(y)];
			} else if (smallest == 3) {
				return [Math.ceil(x), Math.ceil(y)];
			}
		}
	}
});
