const adjectives = [
	"Wobbly",
	"Fluffy",
	"Soggy",
	"Mysterious",
	"Spicy",
	"Lazy",
	"Sneaky",
	"Quantum",
	"Tiny",
];

const nouns = [
	"Pineapple",
	"Platypus",
	"Banana",
	"Unicorn",
	"Robot",
	"Toaster",
	"Penguin",
	"Noodle",
	"Llama",
];

const verbs = [
	"Dances",
	"Explodes",
	"Runs",
	"Sleeps",
	"Whispers",
	"Jumps",
	"Slides",
	"Eats",
];

function randomElement(arr: string[]) {
	return arr[Math.floor(Math.random() * arr.length)];
}

export function generateTitle() {
	// Random pattern: adjective + noun + optional funny verb
	const pattern = Math.random() > 0.5 ? "adjNounVerb" : "adjNoun";

	let title = "";
	if (pattern === "adjNounVerb") {
		title = `${randomElement(adjectives)} ${randomElement(nouns)} ${randomElement(verbs)}`;
	} else {
		title = `${randomElement(adjectives)} ${randomElement(nouns)}`;
	}

	return title;
}
