const terminal = document.getElementById("terminal");
const terminalLines = document.getElementById("terminalLines");
const userCommand = document.getElementById("userCommand");
const userCommandBox = document.getElementById("userCommandBox");
const password = document.getElementById("password");
const passwordBox = document.getElementById("passwordBox");

let message = ["Incorrect password.<br><br>"];
let secretKey = "";
let userInputPassword = "";
let password_input_or_command_input = true;
let flag = false;
let historyTracker = -1;
let counter = 0;
const history = [];

function init() {
	password.oninput = function () {
		if (userInputPassword.length > this.value.length) {
			//user pressed backspace...
			let arr = userInputPassword.split("");
			arr.pop(); //remove last char
			userInputPassword = arr.join("");
			return;
		}
		userInputPassword += this.value.split("").pop(); //add added char to password
		this.value = "";
		for (i = 0; i < userInputPassword.length; i++) {
			this.value += " ";
		}
	};

	password.onpaste = function (event) {
		userInputPassword = event.clipboardData.getData("text");
		this.value = "";
		for (i = 0; i < userInputPassword.length; i++) {
			this.value += " ";
		}
		event.preventDefault();
	};

	function getFocus() {
		if (password_input_or_command_input) {
			userCommand.focus();
		} else {
			password.focus();
		}
	}

	document.documentElement.addEventListener("click", getFocus);
	writeLines(banner, "", 50);
	setTimeout(function () {
		userCommand.focus();
	}, 1000);
}

function passwordVerifier(passcode) {
	let score = 0;
	const key = passcode.length === 0 ? secretKey : passcode;
	for (let i = 0; i < key.length; i++) {
		if (key[i] >= "0" && key[i] <= "9") score += (key[i] - 48) * 2;
		else if (key[i] >= "a" && key[i] <= "z")
			score += key.charCodeAt(i) - 97;
		else if (key[i] >= "A" && key[i] <= "Z")
			score -= key.charCodeAt(i) - 65;
	}
	if (score === (28 + 11) * 2) return true;
	return false;
}

function passwordGenerator() {
	const possible =
		"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

	while (true) {
		secretKey = "";
		for (let i = 0; i < 8; i++) {
			secretKey += possible.charAt(
				Math.floor(Math.random() * possible.length)
			);
		}
		if (passwordVerifier("")) {
			break;
		} else {
			secretKey = "";
		}
	}

	return secretKey;
}

function tabCompletion(tab_command) {
	for (let i = 0; i < commandList.length; i++) {
		if (
			commandList[i].includes(tab_command) &&
			tab_command[0] === commandList[i][0]
		) {
			userCommand.value = commandList[i];
			break;
		}
	}
}

function historyScroll(event) {
	let tab_command = "";
	const key = event.key; // key name
	const keyCode = event.which || event.keyCode; // key ascii code
	const ctrl = event.ctrlKey ? event.ctrlKey : keyCode === 17 ? true : false; // ctrlkey - ctrl key or not, ctrl ascii = 17

	if (keyCode == 86 && ctrl) {
		// console.log("Ctrl+V is pressed.");
	} else if (keyCode == 67 && ctrl) {
		const ctrlc = userCommand.value + "^C";
		displayLine(userCommandLine(ctrlc), "", 0);
		userCommand.value = "";
	}

	if (key === "ArrowUp") {
		if (history.length != 0 && historyTracker != -1) {
			if (historyTracker != 0) {
				historyTracker--;
			}
			userCommand.value = history[historyTracker];
		}
		event.preventDefault();
	} else if (key === "ArrowDown") {
		if (historyTracker != history.length && history.length != 0) {
			if (historyTracker != history.length) {
				historyTracker++;
			}
			userCommand.value = history[historyTracker];
		}
		event.preventDefault();
	}
	if (key === "ArrowDown" && historyTracker === history.length) {
		userCommand.value = "";
	}
	if (key === "Tab") {
		tab_command = userCommand.value;
		tabCompletion(tab_command);
		event.preventDefault();
	}
	if (key === "Escape") {
		userCommand.value = "";
	}
}

function scrollToBottom() {
	window.scrollTo(0, document.body.scrollHeight);
}

function openNewTab(link, time) {
	setTimeout(function () {
		window.open(link, "_blank");
	}, time);
}

function secret(event) {
	if (event.key === "Escape") {
		password.value = "";
	}
	if (event.key === "Enter") {
		let passcode = userInputPassword;
		userInputPassword = "";
		password.value = "";
		if (passwordVerifier(passcode)) {
			message = congratulationsMessage;
			passwordBox.className = "hidden";
			flag = true;
		} else if (passcode === "password") {
			message = ["You can't be that dumb!"];
			passwordBox.className = "hidden";
			flag = true;
		} else {
			counter++;
			if (counter === 3) {
				passwordBox.className = "hidden";
				flag = true;
			} else {
				displayLine("[sudo] password: ", "", 0);
				displayLine("Sorry, try again.", "", 0);
			}
		}
	}

	if (flag) {
		displayLine("[sudo] password: <br><br> ", "nothing", 0);
		userCommand.disabled = false;
		userCommandBox.className = "";
		writeLines(message, "", 50);
		counter = 0;
		flag = false;
		password_input_or_command_input = true;
		message = ["Incorrect password.<br><br>"];
		userCommand.focus();
	}
}

function displayLine(command, style, time) {
	let text = "";
	for (let i = 0; i < command.length; i++) {
		if (command[i] == " " && command[i + 1] == " ") {
			text += "&nbsp;&nbsp;";
			i++;
		} else {
			text += command[i];
		}
	}
	setTimeout(function () {
		let p = document.createElement("p");
		p.innerHTML = text;
		p.className = style;
		terminal.insertBefore(p, terminalLines);
		scrollToBottom();
	}, time);
}

function writeLines(command, style, time) {
	command.forEach(function (item, index) {
		displayLine(item, style, index * time);
	});
}

function userCommandLine(userInput) {
	return (
		'<span class="stark"><span class="leafgreen">guest</span>@<span class="jewel">anujpunjani.dev</span>:$ ~ </span> <span class="evagreen">' +
		userInput +
		"</span>"
	);
}

function enterCommand(event) {
	const key = event.code;
	if (key === "Enter") {
		let userInput = userCommand.value;
		history.push(userInput);
		historyTracker = history.length;
		displayLine(userCommandLine(userInput), "", 0);
		commander(userInput);
		userCommand.value = "";
	}
}

function commander(command) {
	if (command.trim().length === 0) {
		return;
	} else {
		command = command.toLowerCase();
		switch (command) {
			case "clear":
				setTimeout(function () {
					while (terminal.childNodes.length > 2) {
						terminal.removeChild(terminal.firstChild);
					}
				}, 1);
				break;
			case "whoami":
				writeLines(whoami, "", 50);
				break;
			case "man":
				writeLines(man, "", 50);
				break;
			case "work":
				const panic =
					kernelPanics[
						Math.floor(Math.random() * kernelPanics.length)
					];
				writeLines(panic, "nothing", 150);
				break;
			case "sudo":
				userCommandBox.className = "hidden";
				userCommand.disabled = true;
				passwordBox.className = "";
				password_input_or_command_input = false;
				password.focus();
				break;
			case "repo":
				displayLine("opening GitHub repository ... <br><br>", 1);
				openNewTab(sourceLink, 500);
				break;
			case "contact":
				writeLines(contact, "", 50);
				break;
			case "social":
				writeLines(social, "", 50);
				break;
			case "gui":
				displayLine("GUI work in progress... <br><br>", "", 1);
				break;
			case "help":
				writeLines(help, "", 50);
				break;
			case "banner":
				writeLines(banner, "", 50);
				break;
			default:
				let msg = defaultMessage.slice();
				msg[0] = command + ": " + msg[0];
				displayLine(msg, "", 50);
				break;
		}
	}
}

init();
console.log("🥸 Have you tried generating your own secret password? 🥸");
console.log("dont guess 'password'...");
