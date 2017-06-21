const Bilinear = new ZoomMethod({
	process: function(origin, target) {
		/* Cria funções de apoio baseado no tamanho das imagens */
		var translateToOrigin = this.generateTranslateToOrigin(origin, target);
		var getNearestPixels = this.generateNearest(origin, target);
		/* Declara variaveis que serão utilizadas no loop */
		var ox, oy, quad, squaredSum, pixel, weight, r, g, b, a, red, green, blue, alpha;
		/* Declara uma função de apoio */
		function distanceSquared(x0, y0, x1, y1) {
			var res = (x0 - x1) * (x0 - x1) + (y0 - y1) * (y0 - y1);
			if (res === 0)
				res = 0.0001;
			return res;
		}
		/* Faz uma iteração para cada pixel do novo tamanho */
		for (var y = 0; y < target.height; y++) {
			for (var x = 0; x < target.width; x++) {
				/* Descobre onde o pixel atual está na imagem origem */
				[ ox , oy ] = translateToOrigin(x, y); // Observe que estes são valores reais pois estão entre os pixeis existentes na imagem origem
				/* Pega uma lista de 4 pixeis que cercam o pixel da origem */
				quad = getNearestPixels(ox, oy);
				/* Para cada um dos 4 pixeis, calcula e salva o inverso da distancia deste à posição real */
				quad.forEach(pixel => pixel.idistance = 1/distanceSquared(pixel.x, pixel.y, ox, oy));
				/* Faz um somatório do quadrado das distancias */
				squaredSum = quad[0].idistance + quad[1].idistance + quad[2].idistance + quad[3].idistance;
				/* Inicializa os valores do pixel na nova imagem */
				red = 0;
				green = 0;
				blue = 0;
				alpha = 0;
				/* Faz uma iteração para cada um dos 4 pixeis */
				for (var i = 0 ; i < 4 ; i++) {
					pixel = quad[i];
					/* Atribui um peso relativo ao inverso da sua distancia da posição real */
					weight = pixel.idistance / squaredSum; // Observe que se todos os pesos forem somados, o resultado tem que ser 100%.
					/* Busca o valor deste pixel */
					[r, g, b, a] = origin.get(pixel.x, pixel.y);
					/* Adiciona a parcela que este pixel contribui ao pixel alvo */
					red += r * weight;
					green += g * weight;
					blue += b * weight;
					alpha += a * weight;
				}
				/* Coloca no pixel alvo os seus valores calculados */
				target.set(x, y, red, green, blue, alpha);
			}
		}
	},
	generateTranslateToOrigin: function(originSize, targetSize) {
		var linearInterpolation = function(x0, y0, x1, y1, x) {
			return (x * y0 - x1 * y0 - x * y1 + x0 * y1) / (x0 - x1);
		};
		return function(x, y) {
			var newX = linearInterpolation(0, 0, targetSize.width, originSize.width, x);
			var newY = linearInterpolation(0, 0, targetSize.height, originSize.height, y);
			return [newX, newY];
		}
	},
	generateNearest: function(originSize, targetSize) {
		return function(x, y) {
			var pixel0 = {
				x: Math.floor(x),
				y: Math.floor(y)
			}
			  , pixel1 = {
				x: Math.ceil(x),
				y: Math.floor(y)
			}
			  , pixel2 = {
				x: Math.floor(x),
				y: Math.ceil(y)
			}
			  , pixel3 = {
				x: Math.ceil(x),
				y: Math.ceil(y)
			}
			return [pixel0, pixel1, pixel2, pixel3];
		}
	}
});
