const keys = {
	"auth/email-already-in-use": "auth.errors.emailInUse",
	"auth/weak-password": "auth.errors.weakPassword",
	"auth/invalid-email": "auth.errors.invalidEmail",
	"auth/network-request-failed": "auth.errors.network",
};

export function authErrorKey(code) {
	return keys[code] ?? "auth.errors.generic";
}
