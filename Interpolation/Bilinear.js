const Bilinear = new ZoomMethod({
	process: function(origin, target) {
		/* Cria funções de apoio baseado no tamanho das imagens */
		var translateToOrigin = this.generateTranslateToOrigin(origin, target);
		var getNearestPixels = this.generateNearest(origin, target);
		/* Declara variaveis que serão utilizadas no loop */
		var ox, oy, top, right, bottom, left, sumX, sumY, pixel, weight, r, g, b, a, red, green, blue, alpha;
		/* Faz uma iteração para cada pixel do novo tamanho */
		for (var y = 0; y < target.height; y++) {
			for (var x = 0; x < target.width; x++) {
				/* Descobre onde o pixel atual está na imagem origem */
				[ ox , oy ] = translateToOrigin(x, y); // Observe que estes são valores reais pois estão entre os pixeis existentes na imagem origem
				/* Pega os 4 pixeis que cercam o pixel da origem */
				[top, right, bottom, left] = getNearestPixels(ox, oy);
				/* Salva os inversos das distancias no eixo X */
				if (left.x - ox === 0) {
					left.idistance = 1;
					right.idistance = 0;
				} else if (right.y - oy === 0) {
					left.idistance = 0;
					right.idistance = 1;
				} else {
					left.idistance = 1/Math.abs(left.x - ox);
					right.idistance = 1/Math.abs(right.x - ox);
				}
				/* Salva os inversos das distancias no eixo Y */
				if (top.y - oy === 0) {
					top.idistance = 1;
					bottom.idistance = 0;
				} else if (bottom.y - oy === 0) {
					top.idistance = 0;
					bottom.idistance = 1;
				} else {
					top.idistance = 1/Math.abs(top.y - oy);
					bottom.idistance = 1/Math.abs(bottom.y - oy);
				}
				/* Calcula os limites */
				sumY = top.idistance + bottom.idistance;
				sumX = left.idistance + right.idistance;
				/* Distribui os pesos nos dois eixos */
				top.weight = 0.5 * top.idistance / sumY;
				bottom.weight = 0.5 * bottom.idistance / sumY;
				left.weight = 0.5 * left.idistance / sumX;
				right.weight = 0.5 * right.idistance / sumX;
				/* Inicializa os valores do pixel na nova imagem */
				red = 0;
				green = 0;
				blue = 0;
				alpha = 0;
				/* Faz uma iteração para cada um dos 4 pixeis */
				[top, right, bottom, left].forEach(pixel => {
					/* Busca o valor deste pixel */
					[r, g, b, a] = origin.get(pixel.x, pixel.y);
					/* Adiciona a parcela que este pixel contribui ao pixel alvo */
					weight = pixel.weight;
					red += r * weight;
					green += g * weight;
					blue += b * weight;
					alpha += a * weight;
				})
				/* Coloca no pixel alvo os seus valores calculados */
				target.set(x, y, red, green, blue, alpha);
			}
		}
	},
	generateTranslateToOrigin: function(originSize, targetSize) {
		return function(x, y) {
			var newX = Interpolation.linear(0, 0, targetSize.width, originSize.width, x);
			var newY = Interpolation.linear(0, 0, targetSize.height, originSize.height, y);
			return [newX, newY];
		}
	},
	generateNearest: function(originSize, targetSize) {
		return function(x, y) {
			var top = {
				x: Math.round(x),
				y: Math.floor(y)
			}
			  , right = {
				x: Math.ceil(x),
				y: Math.round(y)
			}
			  , bottom = {
				x: Math.round(x),
				y: Math.ceil(y)
			}
			  , left = {
				x: Math.floor(x),
				y: Math.round(y)
			};
			(top.x < 0) && (top.x = 0);
			(right.x < 0) && (right.x = 0);
			(bottom.x < 0) && (bottom.x = 0);
			(left.x < 0) && (left.x = 0);
			(top.y < 0) && (top.y = 0);
			(right.y < 0) && (right.y = 0);
			(bottom.y < 0) && (bottom.y = 0);
			(left.y < 0) && (left.y = 0);
			return [top, right, bottom, left];
		}
	}
});
