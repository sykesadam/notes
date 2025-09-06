import type { LinkMatcher } from "@lexical/react/LexicalAutoLinkPlugin";

// Define a matcher to identify URLs and email addresses
const URL_MATCHER =
	/((https?:\/\/(www\.)?)|(www\.))[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/;

const EMAIL_MATCHER =
	/(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/;

export const urlMatcher: LinkMatcher = (text) => {
	const match = URL_MATCHER.exec(text);
	if (match === null) {
		return null;
	}
	return {
		index: match.index,
		length: match[0].length,
		text: match[0],
		url: match[0],
	};
};

export const emailMatcher: LinkMatcher = (text) => {
	const match = EMAIL_MATCHER.exec(text);
	if (match === null) {
		return null;
	}
	return {
		index: match.index,
		length: match[0].length,
		text: match[0],
		url: `mailto:${match[0]}`,
	};
};
