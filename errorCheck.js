/*
 * Guilherme Rossato - June 2017
 *
 * This script checks all possible incompatibility and shows an error message accordingly.
 */

function checkErrorMessages() {
	let loadingScreen = getElement("loading-screen");
	let errorLabel1 = getElement("error-label-1");
	let errorLabel2 = getElement("error-label-2");

	let checks = {
		fileAPI: (!window.File || !window.FileReader || !window.FileList || !window.Blob),
		canvas: (!CanvasRenderingContext2D),
		timer: (!window.clearInterval || !window.setInterval),
		url: (!window.URL)
	}

	if (checks.fileAPI) {
		errorLabel1.setContent("Erro de Incompatibilidade");
		errorLabel2.setContent("Esta aplicação não pode continuar pois seu browser não suporta leitura de imagens");
		application.state = "error-permanent";
		return;
	}
	if (checks.canvas) {
		errorLabel1.setContent("Erro de Incompatibilidade");
		errorLabel2.setContent("Esta aplicação não pode continuar pois seu browser não suporta desenho dinamico em 2D");
		application.state = "error-permanent";
		return;
	}
	if (checks.timer) {
		errorLabel1.setContent("Erro de Incompatibilidade");
		errorLabel2.setContent("Esta aplicação não pode continuar pois seu browser não sistema de temporizadores");
		application.state = "error-permanent";
		return;
	}
	if (checks.url) {
		errorLabel1.setContent("Erro de Incompatibilidade");
		errorLabel2.setContent("Esta aplicação não pode continuar pois seu browser não sistema de gerencia de links");
		application.state = "error-permanent";
		return;
	}

	application.state = "init";
	onImageSelect(lastLoadedImage) // debug;
}

window.addEventListener("load", checkErrorMessages);